# Service Boundaries

## platform-api

The platform API owns general Shasvata primitives: health, status, contact, advisory leads, report placeholders, mock user shape, CORS, security headers, and JSON logs.

## intelligence-api

The intelligence API owns fixture-backed company, sector, metric, score, compare, and methodology access. It is FastAPI-based so OpenAPI is available by default.

## worker

The worker owns background job readiness. It currently boots, optionally connects to Redis, logs heartbeat events, and exits cleanly on shutdown.
