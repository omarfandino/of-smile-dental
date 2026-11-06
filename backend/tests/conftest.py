import importlib
import os

import psycopg
import pytest
from fastapi.testclient import TestClient

# Tests use their own database so local development data is never touched.
# Start Postgres first: `docker compose up -d db`.
ADMIN_URL = os.environ.get(
    "TEST_ADMIN_URL", "postgresql://ofsmile:ofsmile@localhost:5433/postgres"
)
TEST_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgresql://ofsmile:ofsmile@localhost:5433/ofsmile_test"
)


@pytest.fixture(scope="session", autouse=True)
def _test_database():
    with psycopg.connect(ADMIN_URL, autocommit=True) as conn:
        exists = conn.execute(
            "SELECT 1 FROM pg_database WHERE datname = 'ofsmile_test'"
        ).fetchone()
        if not exists:
            conn.execute("CREATE DATABASE ofsmile_test")


def load_app(reset: bool = True):
    os.environ["DATABASE_URL"] = TEST_URL
    os.environ["DEFAULT_COUNTRY_CODE"] = "57"
    if reset:
        with psycopg.connect(TEST_URL, autocommit=True) as conn:
            conn.execute("DROP TABLE IF EXISTS patients")
    import app.main as main

    importlib.reload(main)
    return TestClient(main.app)


@pytest.fixture()
def client():
    return load_app()
