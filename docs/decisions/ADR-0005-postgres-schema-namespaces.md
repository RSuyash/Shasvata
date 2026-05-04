# ADR-0005: PostgreSQL Schema Namespaces

## Decision

Use PostgreSQL schemas for `core`, `source`, `intelligence`, `content`, `commerce`, `app`, and `audit`.

## Rationale

Schema namespaces keep the foundation explicit without prematurely splitting into many databases or microservices.
