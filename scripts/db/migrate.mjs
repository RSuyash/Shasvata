import { spawnSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required for db:migrate.");
  process.exit(1);
}

const result = spawnSync("psql", [databaseUrl, "-f", "db/migrations/001_foundation.sql"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

process.exit(result.status ?? 1);
