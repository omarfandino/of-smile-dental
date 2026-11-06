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
            CREATE TABLE IF NOT EXISTS pacientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                whatsapp TEXT NOT NULL UNIQUE,
                email TEXT,
                notas TEXT,
                creado_en TEXT NOT NULL
            )
            """
        )


def normalizar_whatsapp(raw: str) -> str:
    digitos = re.sub(r"\D", "", raw or "")
    if digitos.startswith("00"):
        digitos = digitos[2:]
    if len(digitos) == 10:
        digitos = country_code() + digitos
    if not 11 <= len(digitos) <= 15:
        raise ValueError(
            "Escribe el número de WhatsApp completo (10 dígitos, o con código de país)"
        )
    return digitos


class PacienteIn(BaseModel):
    model_config = ConfigDict(validate_default=True)

    nombre: str = ""
    whatsapp: str = ""
    email: str = ""
    notas: str = ""

    @field_validator("nombre")
    @classmethod
    def _nombre(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Escribe el nombre del paciente")
        if len(v) > 100:
            raise ValueError("El nombre es muy largo (máximo 100 caracteres)")
        return v

    @field_validator("whatsapp")
    @classmethod
    def _whatsapp(cls, v: str) -> str:
        return normalizar_whatsapp(v)

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip()
        if v and not EMAIL_RE.match(v):
            raise ValueError("El correo no parece válido (ej. nombre@correo.com)")
        return v

    @field_validator("notas")
    @classmethod
    def _notas(cls, v: str) -> str:
        v = v.strip()
        if len(v) > 300:
            raise ValueError("Las notas admiten máximo 300 caracteres")
        return v


def fila_a_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "nombre": row["nombre"],
        "whatsapp": row["whatsapp"],
        "email": row["email"] or "",
        "notas": row["notas"] or "",
        "creado_en": row["creado_en"],
    }


def create_app() -> FastAPI:
    init_db()
    app = FastAPI(title="OF Smile API")

    @app.exception_handler(RequestValidationError)
    async def _validacion(_: Request, exc: RequestValidationError):
        errores: dict[str, str] = {}
        for e in exc.errors():
            loc = [p for p in e.get("loc", ()) if p != "body"]
            campo = str(loc[0]) if loc else "general"
            msg = str(e.get("msg", "Dato inválido"))
            msg = msg.removeprefix("Value error, ")
            if e.get("type") != "value_error":
                msg = "Dato inválido, revisa este campo"
            errores.setdefault(campo, msg)
        return JSONResponse(status_code=422, content={"errores": errores})

    @app.get("/api/salud")
    def salud():
        return {"ok": True}

    @app.get("/api/pacientes")
    def listar():
        with get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM pacientes ORDER BY id DESC"
            ).fetchall()
        return [fila_a_dict(r) for r in rows]

    @app.post("/api/pacientes", status_code=201)
    def crear(p: PacienteIn):
        with get_conn() as conn:
            existente = conn.execute(
                "SELECT nombre FROM pacientes WHERE whatsapp = ?", (p.whatsapp,)
            ).fetchone()
            if existente:
                return JSONResponse(
                    status_code=409,
                    content={
                        "errores": {
                            "whatsapp": "Ya existe un paciente con este WhatsApp: "
                            + existente["nombre"]
                        }
                    },
                )
            try:
                cur = conn.execute(
                    "INSERT INTO pacientes (nombre, whatsapp, email, notas, creado_en)"
                    " VALUES (?, ?, ?, ?, ?)",
                    (
                        p.nombre,
                        p.whatsapp,
                        p.email,
                        p.notas,
                        datetime.now(timezone.utc).isoformat(timespec="seconds"),
                    ),
                )
            except sqlite3.IntegrityError:
                # Doble envío simultáneo: otro request ganó la carrera.
                return JSONResponse(
                    status_code=409,
                    content={"errores": {"whatsapp": "Ya existe un paciente con este WhatsApp"}},
                )
            row = conn.execute(
                "SELECT * FROM pacientes WHERE id = ?", (cur.lastrowid,)
            ).fetchone()
        return fila_a_dict(row)

    return app


app = create_app()
