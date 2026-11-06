import os
import re
from contextlib import contextmanager

import psycopg
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from psycopg.rows import dict_row
from pydantic import BaseModel, ConfigDict, field_validator

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def database_url() -> str:
    # Tolerate surrounding whitespace/quotes, a common copy-paste slip from .env files.
    return os.environ["DATABASE_URL"].strip().strip("\"'")


def country_code() -> str:
    return os.environ.get("DEFAULT_COUNTRY_CODE", "57")


@contextmanager
def get_conn():
    # prepare_threshold=None: safe behind connection poolers such as Neon's.
    # Leaving the block commits; an exception rolls back.
    with psycopg.connect(
        database_url(),
        row_factory=dict_row,
        connect_timeout=15,
        prepare_threshold=None,
    ) as conn:
        yield conn


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS patients (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name TEXT NOT NULL,
                whatsapp TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL DEFAULT '',
                notes TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """
        )


def normalize_whatsapp(raw: str) -> str:
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("00"):
        digits = digits[2:]
    if len(digits) == 10:
        digits = country_code() + digits
    if not 11 <= len(digits) <= 15:
        raise ValueError(
            "Enter the full WhatsApp number (10 digits, or with country code)"
        )
    return digits


class PatientIn(BaseModel):
    model_config = ConfigDict(validate_default=True)

    name: str = ""
    whatsapp: str = ""
    email: str = ""
    notes: str = ""

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Enter the patient's name")
        if len(v) > 100:
            raise ValueError("The name is too long (100 characters max)")
        return v

    @field_validator("whatsapp")
    @classmethod
    def _whatsapp(cls, v: str) -> str:
        return normalize_whatsapp(v)

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip()
        if v and not EMAIL_RE.match(v):
            raise ValueError("That email doesn't look valid (e.g. name@email.com)")
        return v

    @field_validator("notes")
    @classmethod
    def _notes(cls, v: str) -> str:
        v = v.strip()
        if len(v) > 300:
            raise ValueError("Notes can be 300 characters at most")
        return v


def row_to_dict(row: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "whatsapp": row["whatsapp"],
        "email": row["email"],
        "notes": row["notes"],
        "created_at": row["created_at"].isoformat(timespec="seconds"),
    }


def create_app() -> FastAPI:
    init_db()
    app = FastAPI(title="OF Smile API")

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError):
        errors: dict[str, str] = {}
        for e in exc.errors():
            loc = [p for p in e.get("loc", ()) if p != "body"]
            field = str(loc[0]) if loc else "general"
            msg = str(e.get("msg", "Invalid value"))
            msg = msg.removeprefix("Value error, ")
            if e.get("type") != "value_error":
                msg = "Invalid value, please check this field"
            errors.setdefault(field, msg)
        return JSONResponse(status_code=422, content={"errors": errors})

    @app.get("/api/health")
    def health():
        return {"ok": True, "demo": os.environ.get("DEMO_MODE") == "1"}

    @app.get("/api/patients")
    def list_patients():
        with get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM patients ORDER BY id DESC"
            ).fetchall()
        return [row_to_dict(r) for r in rows]

    @app.post("/api/patients", status_code=201)
    def create_patient(p: PatientIn):
        with get_conn() as conn:
            row = conn.execute(
                "INSERT INTO patients (name, whatsapp, email, notes)"
                " VALUES (%s, %s, %s, %s)"
                " ON CONFLICT (whatsapp) DO NOTHING RETURNING *",
                (p.name, p.whatsapp, p.email, p.notes),
            ).fetchone()
            if row is None:
                existing = conn.execute(
                    "SELECT name FROM patients WHERE whatsapp = %s", (p.whatsapp,)
                ).fetchone()
                return JSONResponse(
                    status_code=409,
                    content={
                        "errors": {
                            "whatsapp": "A patient with this WhatsApp already exists: "
                            + existing["name"]
                        }
                    },
                )
        return row_to_dict(row)

    # The built UI is served last so it never shadows /api routes.
    static_dir = os.environ.get("STATIC_DIR", "/srv/static")
    if os.path.isdir(static_dir):
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="ui")

    return app


app = create_app()
