import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log(JSON.stringify({ ok: true, service: "worker", redis: "not-configured" }));
  process.exit(0);
}

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1
});

try {
  await redis.connect();
  await redis.ping();
  console.log(JSON.stringify({ ok: true, service: "worker", redis: "ready" }));
  await redis.quit();
} catch (error) {
  console.error(JSON.stringify({ ok: false, service: "worker", error: error instanceof Error ? error.message : "unknown" }));
  process.exit(1);
}
