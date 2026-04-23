"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  AuthFeedback,
  authInputClass,
  authInputStyle,
  authLabelClass,
  authPrimaryButtonClass,
  authPrimaryButtonStyle,
} from "./auth-form-primitives";
import { signInWithPasswordForApp } from "@/lib/landing-portal";
import { ROUTES } from "@/lib/routes";

type PasswordSignInFormProps = {
  redirectPath?: string;
  invitedEmail?: string;
  inviteSelector?: string;
  inviteVerifier?: string;
};

export function PasswordSignInForm({
  redirectPath = ROUTES.dashboard.root,
  invitedEmail,
  inviteSelector,
  inviteVerifier,
}: PasswordSignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(invitedEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (invitedEmail) {
      setEmail(invitedEmail);
    }
  }, [invitedEmail]);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
          try {
            const result = await signInWithPasswordForApp({
              email,
              password,
              inviteSelector,
              inviteVerifier,
            });
            router.replace(result.redirectPath ?? redirectPath);
            router.refresh();
          } catch (signInError) {
            setError(
              signInError instanceof Error
                ? signInError.message
                : "Could not sign in right now.",
            );
          }
        });
      }}
    >
      <div className="space-y-2">
        <label htmlFor="portal-email" className={authLabelClass} style={{ color: "var(--muted)" }}>
          Work email
        </label>
        <input
          id="portal-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="client@company.com"
          className={authInputClass}
          style={authInputStyle}
          readOnly={Boolean(invitedEmail)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="portal-password" className={authLabelClass} style={{ color: "var(--muted)" }}>
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Forgot?
          </Link>
        </div>
        <input
          id="portal-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          className={authInputClass}
          style={authInputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={authPrimaryButtonClass}
        style={authPrimaryButtonStyle}
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}
    </form>
  );
}
