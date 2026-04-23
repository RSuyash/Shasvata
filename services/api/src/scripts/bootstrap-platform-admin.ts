import "dotenv/config";
import { bootstrapPlatformAdmin } from "../services/landing-platform-runtime.js";

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index < 0) {
    return undefined;
  }

  return process.argv[index + 1];
}

async function main() {
  const email = readArg("--email")?.trim();
  const password = readArg("--password") ?? "";
  const fullName = readArg("--full-name")?.trim();

  if (!email || !password.trim()) {
    throw new Error(
      "Usage: npm run auth:bootstrap-admin -- --email <email> --password <password> [--full-name <name>]",
    );
  }

  const result = await bootstrapPlatformAdmin({
    email,
    password,
    fullName,
  });

  console.log(
    JSON.stringify(
      {
        status: "ok",
        portalUserId: result.portalUser.id,
        email: result.portalUser.email,
        role: result.portalUser.role,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown bootstrap error.";
  console.error(message);
  process.exitCode = 1;
});
