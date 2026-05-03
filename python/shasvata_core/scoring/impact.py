from shasvata_core.validation.ranges import clamp_score


def impact_score(emissions_intensity: float, renewable_share: float) -> float:
    """Placeholder impact score where lower intensity and higher renewables help."""
    raw = 70 - emissions_intensity * 4 + renewable_share * 0.3
    return clamp_score(raw)
