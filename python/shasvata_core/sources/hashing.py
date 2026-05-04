from __future__ import annotations

import hashlib


def stable_hash(value: str) -> str:
    """Return a deterministic SHA-256 hash for source de-duplication."""
    return hashlib.sha256(value.encode("utf-8")).hexdigest()
