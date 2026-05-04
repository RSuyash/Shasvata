from shasvata_core.validation.ranges import clamp_score


def compensation_score(worker_benefit_ratio: float, living_wage_coverage: float) -> float:
    """Placeholder social compensation score."""
    return clamp_score(worker_benefit_ratio * 40 + living_wage_coverage * 60)
