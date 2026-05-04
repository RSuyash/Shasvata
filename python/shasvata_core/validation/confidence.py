from __future__ import annotations

from shasvata_core.intelligence.enums import ConfidenceGrade

CONFIDENCE_MULTIPLIERS: dict[ConfidenceGrade, float] = {
    ConfidenceGrade.A: 1.0,
    ConfidenceGrade.B: 0.85,
    ConfidenceGrade.C: 0.6,
    ConfidenceGrade.D: 0.25,
}


def confidence_grade_multiplier(grade: ConfidenceGrade | str) -> float:
    """Return the scoring multiplier for a confidence grade."""
    return CONFIDENCE_MULTIPLIERS[ConfidenceGrade(grade)]
