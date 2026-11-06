import os
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, field_validator

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def db_path() -> str:
    return os.environ.get("DB_PATH", "/data/ofsmile.db")


def country_code() -> str:
    return os.environ.get("DEFAULT_COUNTRY_CODE", "57")


@contextmanager
def get_conn():
    conn = sqlite3.connect(db_path())
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    os.makedirs(os.path.dirname(db_path()) or ".", exist_ok=True)
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                whatsapp TEXT NOT NULL UNIQUE,
                email TEXT,
                notes TEXT,
                created_at TEXT NOT NULL
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


def row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "whatsapp": row["whatsapp"],
        "email": row["email"] or "",
        "notes": row["notes"] or "",
        "created_at": row["created_at"],
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
        return {"ok": True}

    @app.get("/api/patients")
    def list_patients():
        with get_conn() as conn:
            rows = conn.execute("SELECT * FROM patients ORDER BY id DESC").fetchall()
        return [row_to_dict(r) for r in rows]

    @app.post("/api/patients", status_code=201)
    def create_patient(p: PatientIn):
        with get_conn() as conn:
            existing = conn.execute(
                "SELECT name FROM patients WHERE whatsapp = ?", (p.whatsapp,)
            ).fetchone()
            if existing:
                return JSONResponse(
                    status_code=409,
                    content={
                        "errors": {
                            "whatsapp": "A patient with this WhatsApp already exists: "
                            + existing["name"]
                        }
                    },
                )
            try:
                cur = conn.execute(
                    "INSERT INTO patients (name, whatsapp, email, notes, created_at)"
                    " VALUES (?, ?, ?, ?, ?)",
                    (
                        p.name,
                        p.whatsapp,
                        p.email,
                        p.notes,
                        datetime.now(timezone.utc).isoformat(timespec="seconds"),
                    ),
                )
            except sqlite3.IntegrityError:
                # Simultaneous double submit: another request won the race.
                return JSONResponse(
                    status_code=409,
                    content={"errors": {"whatsapp": "A patient with this WhatsApp already exists"}},
                )
            row = conn.execute(
                "SELECT * FROM patients WHERE id = ?", (cur.lastrowid,)
            ).fetchone()
        return row_to_dict(row)

    return app


app = create_app()
