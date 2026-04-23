import { AuthShell } from "@/components/landing-portal/auth-shell";
import { GoogleSignInButton } from "@/components/landing-portal/google-sign-in-button";
import { LocalWorkbenchSwitcher } from "@/components/landing-portal/local-workbench-switcher";
import { MagicLinkRequestForm } from "@/components/landing-portal/magic-link-request-form";
import { PasswordSignInForm } from "@/components/landing-portal/password-sign-in-form";
import { PasswordSignUpForm } from "@/components/landing-portal/password-sign-up-form";
import { isLocalPortalWorkbenchEnabled } from "@/lib/local-portal-workbench";
import { ROUTES } from "@/lib/routes";

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(searchParams: SearchParams, key: string): string {
  const value = searchParams[key];
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? "" : "";
}

export default function PortalSignInPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const redirectPath = readParam(searchParams, "redirect") || ROUTES.dashboard.root;
  const inviteSelector = readParam(searchParams, "inviteSelector");
  const inviteVerifier = readParam(searchParams, "inviteVerifier");
  const invitedEmail = readParam(searchParams, "inviteEmail");
  const hasInviteContext = Boolean(inviteSelector && inviteVerifier && invitedEmail);
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    process.env.GOOGLE_WEB_CLIENT_ID?.trim() ||
    "";
  const requestedMode = readParam(searchParams, "mode");
  const activeMode =
    requestedMode === "sign-in" || requestedMode === "sign-up"
      ? requestedMode
      : redirectPath !== ROUTES.dashboard.root
        ? "sign-in"
        : "sign-up";

  const isSignUp = activeMode === "sign-up";
  const workbenchEnabled = isLocalPortalWorkbenchEnabled();

  return (
    <AuthShell
      activeMode={activeMode}
      redirectPath={redirectPath}
      extraQueryParams={
        hasInviteContext
          ? {
              inviteSelector,
              inviteVerifier,
              inviteEmail: invitedEmail,
            }
          : undefined
      }
      title={isSignUp ? "Create an account" : "Welcome back"}
      description={
        hasInviteContext
          ? `This access flow is locked to ${invitedEmail}. Continue with Google or email to join the invited project workspace.`
          : isSignUp
          ? "Create a premium workspace login for project visibility, launch tracking, lead sync health, and cross-team delivery."
          : "Sign in to your Shasvata workspace and pick up exactly where your launch, lead, and delivery operations left off."
      }
      socialSection={
        <GoogleSignInButton
          clientId={googleClientId}
          redirectPath={redirectPath}
          inviteSelector={inviteSelector || undefined}
          inviteVerifier={inviteVerifier || undefined}
        />
      }
    >
      <div className="space-y-4">
        {workbenchEnabled ? (
          <LocalWorkbenchSwitcher
            redirectPath={redirectPath}
            variant="card"
          />
        ) : null}

        {isSignUp ? (
          <PasswordSignUpForm
            redirectPath={redirectPath}
            invitedEmail={invitedEmail || undefined}
            inviteSelector={inviteSelector || undefined}
            inviteVerifier={inviteVerifier || undefined}
          />
        ) : (
          <div className="space-y-4">
            <PasswordSignInForm
              redirectPath={redirectPath}
              invitedEmail={invitedEmail || undefined}
              inviteSelector={inviteSelector || undefined}
              inviteVerifier={inviteVerifier || undefined}
            />
            {hasInviteContext ? null : (
              <details
                className="rounded-[22px] border p-4"
                style={{
                  background: "var(--surface-strong)",
                  borderColor: "var(--divider)",
                }}
              >
                <summary
                  className="cursor-pointer list-none text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Need a magic link instead?
                </summary>
                <div className="mt-4">
                  <MagicLinkRequestForm redirectPath={redirectPath} />
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </AuthShell>
  );
}
