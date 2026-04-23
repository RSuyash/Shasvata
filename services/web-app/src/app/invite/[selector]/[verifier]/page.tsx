import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProjectInviteAcceptView } from "@/components/landing-portal/project-invite-accept-view";
import {
  fetchPortalSessionForApp,
  fetchProjectInviteForApp,
} from "@/lib/landing-portal";
import { ROUTES } from "@/lib/routes";

function serializeCookieHeader() {
  return cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");
}

export default async function ProjectInviteAcceptPage({
  params,
}: {
  params: { selector: string; verifier: string };
}) {
  const cookieHeader = serializeCookieHeader();

  try {
    const [inviteContext, session] = await Promise.all([
      fetchProjectInviteForApp({
        selector: params.selector,
        verifier: params.verifier,
        cookieHeader,
      }),
      fetchPortalSessionForApp(cookieHeader),
    ]);

    return (
      <ProjectInviteAcceptView
        selector={params.selector}
        verifier={params.verifier}
        inviteContext={inviteContext}
        session={session}
      />
    );
  } catch (error) {
    console.error("[landing-portal] Failed to render invite accept page:", error);
    redirect(ROUTES.dashboard.projects);
  }
}
