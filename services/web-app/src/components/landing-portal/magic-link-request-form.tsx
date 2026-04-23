"use client";

import { useState, useTransition } from "react";
import {
  AuthFeedback,
  authInputClass,
  authInputStyle,
  authLabelClass,
  authSecondaryButtonClass,
  authSecondaryButtonStyle,
} from "./auth-form-primitives";
import { requestPortalMagicLinkForApp } from "@/lib/landing-portal";
import { ROUTES } from "@/lib/routes";

type MagicLinkRequestFormProps = {
  redirectPath?: string;
  submitLabel?: string;
  inputId?: string;
};

export function MagicLinkRequestForm({
  redirectPath = ROUTES.dashboard.projects,
  submitLabel = "Email magic link",
  inputId = "magic-link-email",
}: MagicLinkRequestFormProps) {
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
            await requestPortalMagicLinkForApp({
              email,
              redirectPath,
            });
            setMessage("If that email has access, a fresh sign-in link is already on its way.");
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "Could not send the sign-in link.",
            );
          }
        });
      }}
    >
      <div className="space-y-2">
        <label htmlFor={inputId} className={authLabelClass} style={{ color: "var(--muted)" }}>
          Work email
        </label>
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="client@company.com"
          className={authInputClass}
          style={authInputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={authSecondaryButtonClass}
        style={authSecondaryButtonStyle}
      >
        {isPending ? "Sending link..." : submitLabel}
      </button>

      {message ? <AuthFeedback tone="success">{message}</AuthFeedback> : null}
      {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}
    </form>
  );
}
