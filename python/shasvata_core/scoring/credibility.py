from shasvata_core.intelligence.enums import ConfidenceGrade
from shasvata_core.validation.confidence import confidence_grade_multiplier
from shasvata_core.validation.ranges import clamp_score


def credibility_score(reviewed_metric_share: float, grade: ConfidenceGrade | str) -> float:
    """Placeholder credibility score weighted by source confidence."""
    return clamp_score(reviewed_metric_share * 100 * confidence_grade_multiplier(grade))
