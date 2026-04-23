"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AuthFeedback,
  authInputClass,
  authInputStyle,
  authLabelClass,
  authPrimaryButtonClass,
  authPrimaryButtonStyle,
} from "./auth-form-primitives";
import { signUpWithPasswordForApp } from "@/lib/landing-portal";
import { ROUTES } from "@/lib/routes";

export function PasswordSignUpForm({
  redirectPath = ROUTES.dashboard.root,
  invitedEmail,
  inviteSelector,
  inviteVerifier,
}: {
  redirectPath?: string;
  invitedEmail?: string;
  inviteSelector?: string;
  inviteVerifier?: string;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(invitedEmail ?? "");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
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
        setMessage(null);

        startTransition(async () => {
          try {
            const result = await signUpWithPasswordForApp({
              firstName,
              lastName,
              email,
              phone,
              password,
              inviteSelector,
              inviteVerifier,
            });
            if ("authenticated" in result && result.authenticated) {
              router.replace(result.redirectPath ?? redirectPath);
              router.refresh();
              return;
            }

            setMessage(
              "Account created. Check your inbox for the verification link to activate your workspace.",
            );
            setPassword("");
          } catch (signupError) {
            setError(
              signupError instanceof Error
                ? signupError.message
                : "We could not create your account right now.",
            );
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="sign-up-first-name" className={authLabelClass} style={{ color: "var(--muted)" }}>
            First name
          </label>
          <input
            id="sign-up-first-name"
            required
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className={authInputClass}
            style={authInputStyle}
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="sign-up-last-name" className={authLabelClass} style={{ color: "var(--muted)" }}>
            Last name
          </label>
          <input
            id="sign-up-last-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className={authInputClass}
            style={authInputStyle}
            placeholder="Lovelace"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="sign-up-email" className={authLabelClass} style={{ color: "var(--muted)" }}>
          Email
        </label>
        <input
          id="sign-up-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={authInputClass}
          style={authInputStyle}
          placeholder="you@company.com"
          readOnly={Boolean(invitedEmail)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="sign-up-phone" className={authLabelClass} style={{ color: "var(--muted)" }}>
          Phone
        </label>
        <input
          id="sign-up-phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={authInputClass}
          style={authInputStyle}
          placeholder="+1 (775) 351-6501"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="sign-up-password" className={authLabelClass} style={{ color: "var(--muted)" }}>
          Password
        </label>
        <input
          id="sign-up-password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={authInputClass}
          style={authInputStyle}
          placeholder="Create a secure password"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={authPrimaryButtonClass}
        style={authPrimaryButtonStyle}
      >
        {isPending ? "Creating account..." : "Create an account"}
      </button>

      {message ? <AuthFeedback tone="success">{message}</AuthFeedback> : null}
      {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}
    </form>
  );
}
