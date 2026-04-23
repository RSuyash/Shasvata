import { AuthShell } from "@/components/landing-portal/auth-shell";
import { ForgotPasswordForm } from "@/components/landing-portal/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      showModeToggle={false}
      title="Reset your password"
      description="We will send a secure reset link to the email tied to your active Shasvata workspace account."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
