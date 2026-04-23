"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AuthFeedback } from "./auth-form-primitives";
import { consumeEmailVerificationForApp } from "@/lib/landing-portal";
import { ROUTES, signInRedirect } from "@/lib/routes";

type EmailVerificationClientProps = {
  selector: string;
  verifier: string;
};

export function EmailVerificationClient({
  selector,
  verifier,
}: EmailVerificationClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "failed">("pending");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        await consumeEmailVerificationForApp({
          selector,
          verifier,
        });
        router.replace(ROUTES.dashboard.projects);
        router.refresh();
      } catch (verificationError) {
        setStatus("failed");
        setError(
          verificationError instanceof Error
            ? verificationError.message
            : "We could not verify your email right now.",
        );
      }
    });
  }, [router, selector, verifier]);

  if (status === "failed") {
    return (
      <div className="space-y-4">
        <AuthFeedback tone="error">
          {error ?? "That verification link is no longer valid. Request a fresh sign-up email."}
        </AuthFeedback>
        <Link
          href={`${signInRedirect(ROUTES.dashboard.projects)}&mode=sign-up`}
          className="inline-flex text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Return to account creation
        </Link>
      </div>
    );
  }

  return (
    <AuthFeedback tone="neutral">
      We are verifying your email and opening your workspace now.
    </AuthFeedback>
  );
}
