def clamp_score(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    """Clamp score-like values into a bounded range."""
    return max(minimum, min(maximum, value))
