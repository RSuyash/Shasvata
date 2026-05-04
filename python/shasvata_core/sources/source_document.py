from dataclasses import dataclass


@dataclass(frozen=True)
class SourceDocument:
    id: str
    title: str
    source_type: str
    url: str | None = None
