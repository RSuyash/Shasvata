from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    app_env: str
    fixture_root: Path


def get_settings() -> Settings:
    package_file = Path(__file__).resolve()
    repo_root = package_file.parents[4]
    fixture_root = Path(os.getenv("INTELLIGENCE_FIXTURE_ROOT", repo_root / "db" / "fixtures" / "intelligence"))
    return Settings(app_env=os.getenv("APP_ENV", "local"), fixture_root=fixture_root)
