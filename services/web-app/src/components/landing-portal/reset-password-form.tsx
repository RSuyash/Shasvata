"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AuthFeedback,
  authInputClass,
  authInputStyle,
  authLabelClass,
  authPrimaryButtonClass,
  authPrimaryButtonStyle,
} from "./auth-form-primitives";
import { resetPasswordForApp } from "@/lib/landing-portal";
import { ROUTES } from "@/lib/routes";

type ResetPasswordFormProps = {
  selector: string;
  verifier: string;
};

export function ResetPasswordForm({ selector, verifier }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
          try {
            await resetPasswordForApp({
              selector,
              verifier,
              password,
            });
            router.replace(ROUTES.dashboard.projects);
            router.refresh();
          } catch (resetError) {
            setError(
              resetError instanceof Error
                ? resetError.message
                : "We could not reset your password right now.",
            );
          }
        });
      }}
    >
      <div className="space-y-2">
        <label htmlFor="reset-password" className={authLabelClass} style={{ color: "var(--muted)" }}>
          New password
        </label>
        <input
          id="reset-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={authInputClass}
          style={authInputStyle}
          placeholder="Create a new password"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={authPrimaryButtonClass}
        style={authPrimaryButtonStyle}
      >
        {isPending ? "Resetting password..." : "Reset password"}
      </button>

      {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}
    </form>
  );
}
