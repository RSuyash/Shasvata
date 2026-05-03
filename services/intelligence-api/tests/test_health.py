from fastapi.testclient import TestClient

from shasvata_intelligence_api.main import create_app


def test_health_returns_service_status():
    client = TestClient(create_app())
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["service"] == "intelligence-api"


def test_companies_are_fixture_backed():
    client = TestClient(create_app())
    response = client.get("/v1/companies")

    assert response.status_code == 200
    assert len(response.json()) == 3
