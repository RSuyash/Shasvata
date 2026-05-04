import { Redis } from "ioredis";
import { jobRegistry } from "./job-registry.js";

const redisUrl = process.env.REDIS_URL;
let redis: Redis | undefined;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1
  });
  await redis.connect().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown";
    console.error(JSON.stringify({ level: "warn", service: "worker", message: "redis_unavailable", error: message }));
  });
}

console.log(
  JSON.stringify({
    level: "info",
    service: "worker",
    message: "worker_started",
    jobs: jobRegistry.map((job) => job.key)
  })
);

const heartbeat = setInterval(() => {
  console.log(JSON.stringify({ level: "info", service: "worker", message: "heartbeat" }));
}, 30_000);

async function shutdown(signal: string) {
  clearInterval(heartbeat);
  console.log(JSON.stringify({ level: "info", service: "worker", message: "shutdown", signal }));
  await redis?.quit().catch(() => undefined);
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
