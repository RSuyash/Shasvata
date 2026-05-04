from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .settings import get_settings


def load_fixture(name: str) -> Any:
    settings = get_settings()
    path = Path(settings.fixture_root) / name
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)
