import { AuthShell } from "@/components/landing-portal/auth-shell";
import { AuthFeedback } from "@/components/landing-portal/auth-form-primitives";
import { ResetPasswordForm } from "@/components/landing-portal/reset-password-form";

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(searchParams: SearchParams, key: string): string {
  const value = searchParams[key];
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? "" : "";
}

export default function ResetPasswordPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const selector = readParam(searchParams, "selector");
  const verifier = readParam(searchParams, "verifier");

  return (
    <AuthShell
      showModeToggle={false}
      title="Choose a new password"
      description="Reset your workspace password and we will move you straight back into the authenticated app experience."
    >
      {selector && verifier ? (
        <ResetPasswordForm selector={selector} verifier={verifier} />
      ) : (
        <AuthFeedback tone="error">
          This reset link is missing its secure verification details.
        </AuthFeedback>
      )}
    </AuthShell>
  );
}
