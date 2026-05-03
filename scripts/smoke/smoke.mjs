const localTargets = {
  www: "http://localhost:3000/health",
  insights: "http://localhost:3001/health",
  intelligence: "http://localhost:3002/health",
  app: "http://localhost:3003/health",
  admin: "http://localhost:3004/health",
  platformHealth: "http://localhost:4000/health",
  platformStatus: "http://localhost:4000/v1/status",
  intelligenceHealth: "http://localhost:4100/health",
  intelligenceStatus: "http://localhost:4100/v1/status",
  intelligenceCompanies: "http://localhost:4100/v1/companies"
};

const liveTargets = {
  www: "https://shasvata.com/health",
  insights: "https://insights.shasvata.com/health",
  intelligence: "https://intelligence.shasvata.com/health",
  app: "https://app.shasvata.com/health",
  admin: "https://admin.shasvata.com/health",
  platformHealth: "https://api.shasvata.com/health",
  platformStatus: "https://api.shasvata.com/v1/status",
  intelligenceHealth: "https://api.shasvata.com/intelligence/health",
  intelligenceStatus: "https://api.shasvata.com/intelligence/v1/status",
  intelligenceCompanies: "https://api.shasvata.com/intelligence/v1/companies"
};

const targetSet = process.env.SMOKE_TARGET === "live" ? liveTargets : localTargets;
const failures = [];

for (const [name, url] of Object.entries(targetSet)) {
  try {
    const response = await fetch(process.env[`SMOKE_${name.toUpperCase()}_URL`] || url);
    if (!response.ok) {
      failures.push(`${name}: ${response.status} ${response.statusText}`);
    } else {
      console.log(`ok ${name} ${response.status}`);
    }
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

if (failures.length > 0) {
  console.error("Smoke checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Smoke checks passed.");
