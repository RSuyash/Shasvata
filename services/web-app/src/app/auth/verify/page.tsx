import { AuthShell } from "@/components/landing-portal/auth-shell";
import { AuthFeedback } from "@/components/landing-portal/auth-form-primitives";
import { MagicLinkVerifyClient } from "@/components/landing-portal/magic-link-verify-client";
import { ROUTES } from "@/lib/routes";

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(searchParams: SearchParams, key: string): string {
  const value = searchParams[key];
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? "" : "";
}

export default function PortalVerifyPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const selector = readParam(searchParams, "selector");
  const verifier = readParam(searchParams, "verifier");
  const redirectPath = readParam(searchParams, "redirect") || ROUTES.dashboard.projects;

  return (
    <AuthShell
      showModeToggle={false}
      title="Opening your workspace"
      description="Magic links still work as a secure fallback lane while the new premium auth flow expands around password and Google sign-in."
    >
      {selector && verifier ? (
        <MagicLinkVerifyClient
          selector={selector}
          verifier={verifier}
          redirectPath={redirectPath}
        />
      ) : (
        <AuthFeedback tone="error">
          This magic-link URL is missing its verification details.
        </AuthFeedback>
      )}
    </AuthShell>
  );
}
