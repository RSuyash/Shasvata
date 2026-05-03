from __future__ import annotations

from dataclasses import dataclass, field

from .enums import ConfidenceGrade


@dataclass(frozen=True)
class MetricValue:
    key: str
    value: float
    unit: str
    confidence_grade: ConfidenceGrade
    citation_ids: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class CompanySnapshot:
    slug: str
    name: str
    sector: str
    metrics: list[MetricValue] = field(default_factory=list)
