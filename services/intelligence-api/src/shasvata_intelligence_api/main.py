from __future__ import annotations

from datetime import UTC, datetime

from fastapi import FastAPI, HTTPException

from .fixtures import load_fixture
from .models import Company, CompareRequest, HealthResponse, Methodology, Metric, Score
from .settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Shasvata Intelligence API", version="0.1.0")

    @app.get("/health", response_model=HealthResponse)
    def health() -> dict[str, str | bool]:
        return {
            "ok": True,
            "service": "intelligence-api",
            "environment": settings.app_env,
            "version": "0.1.0",
            "timestamp": datetime.now(UTC).isoformat(),
        }

    @app.get("/v1/status")
    def status() -> dict[str, object]:
        return {
            "ok": True,
            "service": "intelligence-api",
            "data": "fixture-backed",
            "openapi": "/docs",
        }

    @app.get("/v1/companies", response_model=list[Company])
    def companies() -> list[dict[str, object]]:
        return load_fixture("companies.json")

    @app.get("/v1/companies/{slug}", response_model=Company)
    def company(slug: str) -> dict[str, object]:
        for item in load_fixture("companies.json"):
            if item["slug"] == slug:
                return item
        raise HTTPException(status_code=404, detail="Company not found")

    @app.get("/v1/companies/{slug}/metrics", response_model=list[Metric])
    def company_metrics(slug: str) -> list[dict[str, object]]:
        return [item for item in load_fixture("metrics.json") if item["entitySlug"] == slug]

    @app.get("/v1/companies/{slug}/scores", response_model=list[Score])
    def company_scores(slug: str) -> list[dict[str, object]]:
        return [item for item in load_fixture("scores.json") if item["entitySlug"] == slug]

    @app.get("/v1/sectors")
    def sectors() -> list[dict[str, str]]:
        names = sorted({item["sector"] for item in load_fixture("companies.json")})
        return [{"slug": name.lower().replace(" ", "-"), "name": name} for name in names]

    @app.get("/v1/sectors/{slug}")
    def sector(slug: str) -> dict[str, object]:
        sector_name = slug.replace("-", " ")
        companies_in_sector = [
            item for item in load_fixture("companies.json") if item["sector"].lower() == sector_name
        ]
        return {"slug": slug, "companies": companies_in_sector}

    @app.post("/v1/compare")
    def compare(request: CompareRequest) -> dict[str, object]:
        companies_by_slug = {item["slug"]: item for item in load_fixture("companies.json")}
        selected = [companies_by_slug[slug] for slug in request.company_slugs if slug in companies_by_slug]
        return {"items": selected, "count": len(selected)}

    @app.get("/v1/methodology", response_model=Methodology)
    def methodology() -> dict[str, object]:
        return load_fixture("methodology.json")

    return app


app = create_app()
