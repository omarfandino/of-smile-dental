import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DB_PATH", str(tmp_path / "test.db"))
    monkeypatch.setenv("DEFAULT_COUNTRY_CODE", "57")
    import app.main as main

    importlib.reload(main)
    return TestClient(main.app)


def test_crear_normaliza_y_lista_primero(client):
    client.post("/api/pacientes", json={"nombre": "Luis", "whatsapp": "3009998888"})
    r = client.post(
        "/api/pacientes", json={"nombre": "  Ana   Pérez ", "whatsapp": "300 123 4567"}
    )
    assert r.status_code == 201
    assert r.json()["whatsapp"] == "573001234567"
    assert r.json()["nombre"] == "Ana Pérez"
    lista = client.get("/api/pacientes").json()
    assert lista[0]["nombre"] == "Ana Pérez"


def test_persiste_entre_instancias(tmp_path, monkeypatch):
    monkeypatch.setenv("DB_PATH", str(tmp_path / "p.db"))
    import app.main as main

    importlib.reload(main)
    TestClient(main.app).post(
        "/api/pacientes", json={"nombre": "Ana", "whatsapp": "3001234567"}
    )
    importlib.reload(main)  # simula reinicio del contenedor
    assert len(TestClient(main.app).get("/api/pacientes").json()) == 1


@pytest.mark.parametrize(
    "cuerpo,campo",
    [
        ({"nombre": "", "whatsapp": "3001234567"}, "nombre"),
        ({"nombre": "Ana", "whatsapp": "12345"}, "whatsapp"),
        ({"nombre": "Ana", "whatsapp": "1" * 16}, "whatsapp"),
        ({"nombre": "Ana", "whatsapp": "3001234567", "email": "mal"}, "email"),
        ({"nombre": "Ana", "whatsapp": "3001234567", "notas": "x" * 301}, "notas"),
        ({}, "nombre"),
    ],
)
def test_validacion_por_campo(client, cuerpo, campo):
    r = client.post("/api/pacientes", json=cuerpo)
    assert r.status_code == 422
    assert campo in r.json()["errores"]
    assert client.get("/api/pacientes").json() == []


def test_duplicado_con_otro_formato(client):
    client.post("/api/pacientes", json={"nombre": "Ana", "whatsapp": "3001234567"})
    r = client.post(
        "/api/pacientes", json={"nombre": "Otra", "whatsapp": "+57 300-123-4567"}
    )
    assert r.status_code == 409
    assert "Ana" in r.json()["errores"]["whatsapp"]
    assert len(client.get("/api/pacientes").json()) == 1
