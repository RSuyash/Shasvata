from shasvata_core.validation.ranges import clamp_score


def value_based_impact_score(impact: float, compensation: float, credibility: float) -> float:
    """Foundation VBI placeholder as an equal-weighted composite."""
    return clamp_score((impact + compensation + credibility) / 3)
