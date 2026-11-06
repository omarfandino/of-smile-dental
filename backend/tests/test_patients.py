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


def test_create_normalizes_and_lists_newest_first(client):
    client.post("/api/patients", json={"name": "Luis", "whatsapp": "3009998888"})
    r = client.post(
        "/api/patients", json={"name": "  Ana   Pérez ", "whatsapp": "300 123 4567"}
    )
    assert r.status_code == 201
    assert r.json()["whatsapp"] == "573001234567"
    assert r.json()["name"] == "Ana Pérez"
    assert client.get("/api/patients").json()[0]["name"] == "Ana Pérez"


def test_persists_across_instances(tmp_path, monkeypatch):
    monkeypatch.setenv("DB_PATH", str(tmp_path / "p.db"))
    import app.main as main

    importlib.reload(main)
    TestClient(main.app).post(
        "/api/patients", json={"name": "Ana", "whatsapp": "3001234567"}
    )
    importlib.reload(main)  # simulates a container restart
    assert len(TestClient(main.app).get("/api/patients").json()) == 1


@pytest.mark.parametrize(
    "body,field",
    [
        ({"name": "", "whatsapp": "3001234567"}, "name"),
        ({"name": "Ana", "whatsapp": "12345"}, "whatsapp"),
        ({"name": "Ana", "whatsapp": "1" * 16}, "whatsapp"),
        ({"name": "Ana", "whatsapp": "3001234567", "email": "bad"}, "email"),
        ({"name": "Ana", "whatsapp": "3001234567", "notes": "x" * 301}, "notes"),
        ({}, "name"),
    ],
)
def test_per_field_validation(client, body, field):
    r = client.post("/api/patients", json=body)
    assert r.status_code == 422
    assert field in r.json()["errors"]
    assert client.get("/api/patients").json() == []


def test_duplicate_in_different_format(client):
    client.post("/api/patients", json={"name": "Ana", "whatsapp": "3001234567"})
    r = client.post(
        "/api/patients", json={"name": "Other", "whatsapp": "+57 300-123-4567"}
    )
    assert r.status_code == 409
    assert "Ana" in r.json()["errors"]["whatsapp"]
    assert len(client.get("/api/patients").json()) == 1
