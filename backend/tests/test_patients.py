import pytest

from tests.conftest import load_app


def test_create_normalizes_and_lists_newest_first(client):
    client.post("/api/patients", json={"name": "Luis", "whatsapp": "3009998888"})
    r = client.post(
        "/api/patients", json={"name": "  Ana   Pérez ", "whatsapp": "300 123 4567"}
    )
    assert r.status_code == 201
    assert r.json()["whatsapp"] == "573001234567"
    assert r.json()["name"] == "Ana Pérez"
    assert client.get("/api/patients").json()[0]["name"] == "Ana Pérez"


def test_persists_across_instances():
    first = load_app()
    first.post("/api/patients", json={"name": "Ana", "whatsapp": "3001234567"})
    second = load_app(reset=False)  # simulates an app restart on the same database
    assert len(second.get("/api/patients").json()) == 1


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


def test_health_reports_demo_flag(client, monkeypatch):
    assert client.get("/api/health").json() == {"ok": True, "demo": False}
    monkeypatch.setenv("DEMO_MODE", "1")
    assert client.get("/api/health").json()["demo"] is True
