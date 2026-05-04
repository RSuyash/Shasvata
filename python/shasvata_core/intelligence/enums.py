from enum import StrEnum


class ConfidenceGrade(StrEnum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"


class DisclosureStatus(StrEnum):
    SAMPLE = "sample"
    DRAFT = "draft"
    REVIEWED = "reviewed"
    PUBLISHED = "published"
