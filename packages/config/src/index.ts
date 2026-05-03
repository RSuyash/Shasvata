export const appMetadata = {
  www: {
    name: "Shasvata",
    domain: "shasvata.com"
  },
  insights: {
    name: "Shasvata Insights",
    domain: "insights.shasvata.com"
  },
  intelligence: {
    name: "Shasvata Intelligence",
    domain: "intelligence.shasvata.com"
  },
  app: {
    name: "Shasvata App",
    domain: "app.shasvata.com"
  },
  admin: {
    name: "Shasvata Admin",
    domain: "admin.shasvata.com"
  }
} as const;

export function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function readOptionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}
