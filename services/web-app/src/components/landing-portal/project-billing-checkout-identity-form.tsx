"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { updateProjectBillingCheckoutIdentityForApp } from "@/lib/landing-portal";
import {
  formatCheckoutPhoneDisplay,
  sanitizeCheckoutPhoneInput,
} from "@/lib/checkout-identity";

export function ProjectBillingCheckoutIdentityForm(props: {
  projectId: string;
  currentPhone: string | null;
  billingEmail: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [billingPhone, setBillingPhone] = useState(formatCheckoutPhoneDisplay(props.currentPhone));
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasPhoneValue = billingPhone.trim().length > 0;

  const guidance = useMemo(() => {
    if (props.billingEmail) {
      return `Cashfree will open payment options for this number while billing confirmations continue through ${props.billingEmail}.`;
    }

    return "Cashfree will open payment options for this number during checkout. Add the phone the client should actually use.";
  }, [props.billingEmail]);

  function saveCheckoutPhone() {
    setStatus(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await updateProjectBillingCheckoutIdentityForApp({
          projectId: props.projectId,
          billingPhone: billingPhone.trim() || null,
        });
        setBillingPhone(formatCheckoutPhoneDisplay(response.config.checkoutPhone));
        setStatus(
          response.config.checkoutPhone
            ? "Checkout phone saved for this workspace."
            : "Checkout phone cleared for this workspace.",
        );
        router.refresh();
      } catch (saveError) {
        setError(
          saveError instanceof Error ? saveError.message : "Checkout phone update failed.",
        );
      }
    });
  }

  return (
    <div className="space-y-3 rounded-[20px] bg-[var(--portal-surface-soft)] p-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--portal-muted)]">
          Checkout identity
        </p>
        <p className="mt-2 text-sm font-semibold text-[var(--portal-foreground)]">
          {props.currentPhone
            ? formatCheckoutPhoneDisplay(props.currentPhone)
            : "No checkout phone added yet"}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--portal-muted)]">{guidance}</p>
      </div>

      {props.canEdit ? (
        <>
          <div className="rounded-[18px] border border-[var(--portal-border)] bg-[var(--portal-surface)] p-3">
            <label
              htmlFor={`checkout-phone-${props.projectId}`}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--portal-muted)]"
            >
              Mobile number used on Cashfree
            </label>
            <p className="mt-2 text-sm text-[var(--portal-muted)]">
              Paste the client&apos;s mobile number. Spaces, dashes, and <span className="font-medium">+91</span>{" "}
              are cleaned automatically.
            </p>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <input
              id={`checkout-phone-${props.projectId}`}
              type="tel"
              value={billingPhone}
              onChange={(event) =>
                setBillingPhone(sanitizeCheckoutPhoneInput(event.target.value))
              }
              placeholder="+91 98765 43210"
              inputMode="tel"
              autoComplete="tel-national"
              className="rounded-[18px] border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-3 text-sm text-[var(--portal-foreground)] outline-none placeholder:text-[var(--portal-muted)]"
            />
            <button
              type="button"
              onClick={saveCheckoutPhone}
              disabled={isPending}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-accent)] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--portal-accent-foreground)] disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save phone"}
            </button>
            <button
              type="button"
              onClick={() => setBillingPhone("")}
              disabled={isPending || !hasPhoneValue}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--portal-foreground)] disabled:opacity-50"
            >
              Clear
            </button>
          </div>
          </div>

          {status ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {status}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </>
      ) : (
        <p className="rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-3 text-sm text-[var(--portal-muted)]">
          A project owner can update the checkout phone for this workspace.
        </p>
      )}
    </div>
  );
}
