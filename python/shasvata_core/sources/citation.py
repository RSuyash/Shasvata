from dataclasses import dataclass


@dataclass(frozen=True)
class Citation:
    source_document_id: str
    locator: str
    excerpt: str
