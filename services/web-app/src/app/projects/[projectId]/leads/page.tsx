import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientProjectLeadsView } from "@/components/landing-portal/client-project-leads-view";
import {
  fetchProjectLeadTombstonesForApp,
  fetchPortalSessionForApp,
  fetchProjectDetailForApp,
  fetchProjectLeadsForApp,
} from "@/lib/landing-portal";
import { ROUTES, signInRedirect } from "@/lib/routes";

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

export default async function ProjectLeadsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const cookieHeader = serializeCookieHeader();
  const session = await fetchPortalSessionForApp(cookieHeader);

  if (!session) {
    redirect(signInRedirect(ROUTES.dashboard.projectLeads(params.projectId)));
  }

  try {
    const project = await fetchProjectDetailForApp({
      cookieHeader,
      projectId: params.projectId,
    });
    const isOperator =
      session.portalUser.role === "PLATFORM_ADMIN" ||
      session.portalUser.role === "PLATFORM_OPERATOR";
    const canViewHidden = isOperator || project.membershipRole === "OWNER";

    const [activeLeads, hiddenLeads, tombstones] = await Promise.all([
      fetchProjectLeadsForApp({
        cookieHeader,
        projectId: params.projectId,
        tab: "active",
      }),
      canViewHidden
        ? fetchProjectLeadsForApp({
            cookieHeader,
            projectId: params.projectId,
            tab: "hidden",
          })
        : Promise.resolve([]),
      isOperator
        ? fetchProjectLeadTombstonesForApp({
            cookieHeader,
            projectId: params.projectId,
          })
        : Promise.resolve([]),
    ]);

    return (
      <ClientProjectLeadsView
        user={session.portalUser}
        project={project}
        activeLeads={activeLeads}
        hiddenLeads={hiddenLeads}
        tombstones={tombstones}
      />
    );
  } catch (error) {
    console.error("[landing-portal] Failed to render client leads page:", error);
    redirect(ROUTES.dashboard.projects);
  }
}
