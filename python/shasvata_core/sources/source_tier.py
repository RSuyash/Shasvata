from enum import StrEnum


class SourceTier(StrEnum):
    STRUCTURED_PUBLIC = "structured_public"
    OFFICIAL_PDF = "official_pdf"
    VOLUNTARY = "voluntary"
    MISSING = "missing"
