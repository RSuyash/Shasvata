"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  AuthFeedback,
  authInputClass,
  authInputStyle,
  authLabelClass,
  authPrimaryButtonClass,
  authPrimaryButtonStyle,
} from "./auth-form-primitives";
import { requestPasswordResetForApp } from "@/lib/landing-portal";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        startTransition(async () => {
          try {
            await requestPasswordResetForApp({ email });
            setMessage(
              "If that email belongs to an active account, a reset link has already been sent.",
            );
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "We could not start the password reset flow.",
            );
          }
        });
      }}
    >
      <div className="space-y-2">
        <label htmlFor="forgot-email" className={authLabelClass} style={{ color: "var(--muted)" }}>
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={authInputClass}
          style={authInputStyle}
          placeholder="you@company.com"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={authPrimaryButtonClass}
        style={authPrimaryButtonStyle}
      >
        {isPending ? "Sending reset link..." : "Send reset link"}
      </button>

      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Remembered it? <Link href="/auth/sign-in?mode=sign-in" className="font-semibold" style={{ color: "var(--foreground)" }}>Return to sign in</Link>
      </p>

      {message ? <AuthFeedback tone="success">{message}</AuthFeedback> : null}
      {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}
    </form>
  );
}
