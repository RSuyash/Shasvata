def llm_assist_extraction_prompt(metric_key: str) -> str:
    """Return a deterministic placeholder prompt for future assisted extraction."""
    return f"Extract source-backed value for {metric_key}. Manual review required."
