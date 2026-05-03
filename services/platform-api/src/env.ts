import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  APP_ENV: z.string().default("local"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: z.string().default("http://localhost:3000")
});

export type PlatformEnv = z.infer<typeof EnvSchema>;

export function readEnv(input: NodeJS.ProcessEnv = process.env): PlatformEnv {
  return EnvSchema.parse(input);
}

export function readCorsOrigins(value: string): string[] {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
