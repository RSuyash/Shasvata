"use client";

import { startTransition, useState } from "react";
import {
  createCheckoutSessionFromBillingSnapshotForApp,
} from "@/lib/commerce";
import { launchCashfreeCheckout } from "@/lib/cashfree-checkout";

export function BillingPayNowButton(props: {
  billingSnapshotId: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        className={`inline-flex items-center justify-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--portal-accent-foreground)] shadow-[0_18px_40px_rgba(15,23,42,0.14)] transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ""}`.trim()}
        disabled={props.disabled || isPending}
        onClick={() => {
          setIsPending(true);
          setError(null);

          startTransition(() => {
            void createCheckoutSessionFromBillingSnapshotForApp({
              billingSnapshotId: props.billingSnapshotId,
              returnUrl: window.location.href,
              cancelUrl: window.location.href,
            })
              .then(async (session) => {
                if (session.environment === "MOCK") {
                  setError(
                    "Local sandbox checkout prepared. Cashfree stays simulated in workbench mode.",
                  );
                  return;
                }

                await launchCashfreeCheckout(session);
              })
              .catch((nextError) => {
                setError(
                  nextError instanceof Error
                    ? nextError.message
                    : "Unable to start checkout right now.",
                );
              })
              .finally(() => {
                setIsPending(false);
              });
          });
        }}
        type="button"
      >
        {isPending ? "Preparing checkout..." : props.label ?? "Pay now"}
      </button>
      {error ? (
        <p className="max-w-sm text-xs leading-5 text-rose-600 dark:text-rose-300">{error}</p>
      ) : null}
    </div>
  );
}
