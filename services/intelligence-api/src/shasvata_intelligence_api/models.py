from __future__ import annotations

from pydantic import BaseModel, Field


class Company(BaseModel):
    slug: str
    name: str
    sector: str
    status: str = "sample"


class Metric(BaseModel):
    entity_slug: str = Field(alias="entitySlug")
    metric_key: str = Field(alias="metricKey")
    label: str
    value: float
    unit: str
    confidence_grade: str = Field(alias="confidenceGrade")
    source_label: str = Field(alias="sourceLabel")


class Score(BaseModel):
    entity_slug: str = Field(alias="entitySlug")
    score_key: str = Field(alias="scoreKey")
    value: float
    confidence_grade: str = Field(alias="confidenceGrade")
    methodology_version: str = Field(alias="methodologyVersion")


class Methodology(BaseModel):
    version: str
    status: str
    notes: str


class CompareRequest(BaseModel):
    company_slugs: list[str] = Field(alias="companySlugs", min_length=1)


class HealthResponse(BaseModel):
    ok: bool
    service: str
    environment: str
    version: str
    timestamp: str
