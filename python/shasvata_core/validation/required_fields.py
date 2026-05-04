def missing_required_fields(payload: dict[str, object], required: list[str]) -> list[str]:
    """Return required keys absent from a payload."""
    return [field for field in required if payload.get(field) in (None, "")]
