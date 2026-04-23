import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { backfillProjectedLeadsForProject } from "../services/leads.js";

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index < 0) {
    return undefined;
  }

  return process.argv[index + 1];
}

async function resolveProjectId() {
  const projectId = readArg("--project-id")?.trim();
  if (projectId) {
    return projectId;
  }

  const projectSlug = readArg("--project-slug")?.trim().toLowerCase();
  if (!projectSlug) {
    throw new Error(
      "Usage: npm run leads:backfill-project -- --project-id <id> | --project-slug <slug>",
    );
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug,
    },
    select: {
      id: true,
    },
  });

  if (!project) {
    throw new Error(`Project not found for slug ${projectSlug}`);
  }

  return project.id;
}

async function main() {
  const projectId = await resolveProjectId();
  const result = await backfillProjectedLeadsForProject(projectId);

  console.log(
    JSON.stringify(
      {
        status: "ok",
        ...result,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown backfill error.";
  console.error(message);
  process.exitCode = 1;
});
