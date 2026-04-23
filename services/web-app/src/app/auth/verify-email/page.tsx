import { AuthShell } from "@/components/landing-portal/auth-shell";
import { AuthFeedback } from "@/components/landing-portal/auth-form-primitives";
import { EmailVerificationClient } from "@/components/landing-portal/email-verification-client";

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(searchParams: SearchParams, key: string): string {
  const value = searchParams[key];
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? "" : "";
}

export default function VerifyEmailPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const selector = readParam(searchParams, "selector");
  const verifier = readParam(searchParams, "verifier");

  return (
    <AuthShell
      showModeToggle={false}
      title="Verifying your email"
      description="We are activating your account so your workspace opens with the same secure session contract as password and Google sign-in."
    >
      {selector && verifier ? (
        <EmailVerificationClient selector={selector} verifier={verifier} />
      ) : (
        <AuthFeedback tone="error">
          This verification link is missing its secure token pair.
        </AuthFeedback>
      )}
    </AuthShell>
  );
}
