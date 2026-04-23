"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AuthFeedback } from "./auth-form-primitives";
import { consumePortalMagicLinkForApp } from "@/lib/landing-portal";

type MagicLinkVerifyClientProps = {
  selector: string;
  verifier: string;
  redirectPath: string;
};

export function MagicLinkVerifyClient({
  selector,
  verifier,
  redirectPath,
}: MagicLinkVerifyClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "failed">("pending");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const response = await consumePortalMagicLinkForApp({
          selector,
          verifier,
        });
        router.replace(response.redirectPath || redirectPath);
      } catch (verificationError) {
        setStatus("failed");
        setError(
          verificationError instanceof Error
            ? verificationError.message
            : "This sign-in link could not be verified.",
        );
      }
    });
  }, [redirectPath, router, selector, verifier]);

  if (status === "failed") {
    return (
      <div className="space-y-4">
        <AuthFeedback tone="error">
          {error ??
            "Magic links expire quickly and each one can be used only once. Request a fresh link to continue."}
        </AuthFeedback>

        <Link
          href={`/auth/sign-in?mode=sign-in&redirect=${encodeURIComponent(redirectPath)}`}
          className="inline-flex text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Request a fresh sign-in link
        </Link>
      </div>
    );
  }

  return (
    <AuthFeedback tone="neutral">
      Verifying the link, setting the secure session, and routing you into the right workspace.
    </AuthFeedback>
  );
}
