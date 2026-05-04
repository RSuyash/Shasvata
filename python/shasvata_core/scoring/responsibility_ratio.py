def responsibility_ratio(positive_action_value: float, negative_externality_value: float) -> float:
    """Return a bounded ratio of action value to externality value."""
    if negative_externality_value <= 0:
        return positive_action_value
    return positive_action_value / negative_externality_value
