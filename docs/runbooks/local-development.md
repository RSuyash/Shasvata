# Local Development Runbook

1. Install dependencies:

```bash
pnpm install
python -m pip install -r services/intelligence-api/requirements.txt
```

2. Run checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm python:test
```

3. Start local apps:

```bash
pnpm dev
```

4. Start Docker stack:

```bash
docker compose up -d --build
pnpm smoke
```
