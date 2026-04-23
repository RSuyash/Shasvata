import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import {
  createImportedProject,
  inviteProjectMember,
} from "../services/landing-platform-runtime.js";

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index < 0) {
    return undefined;
  }

  return process.argv[index + 1];
}

async function main() {
  const operatorEmail = readArg("--operator-email")?.trim().toLowerCase();
  const projectSlug = readArg("--project-slug")?.trim();
  const projectName = readArg("--project-name")?.trim();
  const repoUrl = readArg("--repo-url")?.trim();
  const domain = readArg("--domain")?.trim();
  const clientCompany = readArg("--client-company")?.trim();
  const ownerEmail = readArg("--owner-email")?.trim().toLowerCase();
  const ownerName = readArg("--owner-name")?.trim();

  if (!operatorEmail || !projectSlug || !projectName || !repoUrl) {
    throw new Error(
      "Usage: npm run landing:bootstrap-project -- --operator-email <email> --project-slug <slug> --project-name <name> --repo-url <url> [--domain <host>] [--client-company <name>] [--owner-email <email>] [--owner-name <name>]",
    );
  }

  const operator = await prisma.portalUser.findUnique({
    where: {
      email: operatorEmail,
    },
  });

  if (!operator) {
    throw new Error(`Operator portal user not found for ${operatorEmail}`);
  }

  if (operator.role !== "PLATFORM_ADMIN" && operator.role !== "PLATFORM_OPERATOR") {
    throw new Error(`${operatorEmail} does not have operator access.`);
  }

  const created = await createImportedProject({
    portalUserId: operator.id,
    projectSlug,
    projectName,
    repoUrl,
    repoBranch: "main",
    clientCompany,
    desiredLiveDomain: domain,
    operatorNotes: "Bootstrapped via landing project setup script.",
  });

  let invitedMember: { email: string; role: "OWNER" | "VIEWER" } | null = null;
  if (ownerEmail) {
    const member = await inviteProjectMember({
      portalUserId: operator.id,
      projectId: created.project.id,
      email: ownerEmail,
      fullName: ownerName,
      role: "OWNER",
    });

    invitedMember = {
      email: member.email,
      role: member.role,
    };
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        projectId: created.project.id,
        projectSlug: created.project.slug,
        siteId: created.site.id,
        previewHost: created.site.previewHost,
        domainId: created.domain?.id ?? null,
        domainHost: created.domain?.host ?? null,
        invitedMember,
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
