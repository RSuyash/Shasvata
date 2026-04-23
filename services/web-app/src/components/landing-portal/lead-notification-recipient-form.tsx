"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addProjectNotificationRecipientForApp,
  removeProjectNotificationRecipientForApp,
  type ProjectNotificationRecipient,
} from "@/lib/landing-portal";

type LeadNotificationRecipientFormProps = {
  projectId: string;
  recipients: ProjectNotificationRecipient[];
};

export function LeadNotificationRecipientForm({
  projectId,
  recipients,
}: LeadNotificationRecipientFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {recipients.length > 0 ? (
          recipients.map((recipient) => (
            <div
              key={recipient.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--portal-foreground)]">
                  {recipient.label || recipient.email}
                </p>
                <p className="truncate text-sm text-[var(--portal-muted)]">{recipient.email}</p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setMessage(null);
                  setError(null);

                  startTransition(async () => {
                    try {
                      await removeProjectNotificationRecipientForApp({
                        projectId,
                        recipientId: recipient.id,
                      });
                      setMessage(`Removed ${recipient.email} from lead alerts.`);
                      router.refresh();
                    } catch (removeError) {
                      setError(
                        removeError instanceof Error
                          ? removeError.message
                          : "The alert recipient could not be removed right now.",
                      );
                    }
                  });
                }}
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--portal-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--portal-muted)] transition hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-4 text-sm text-[var(--portal-muted)]">
            No project-specific recipients yet. Naya still receives alerts through the global ops inbox.
          </div>
        )}
      </div>

      <form
        className="space-y-4 rounded-[24px] border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          setError(null);

          startTransition(async () => {
            try {
              const response = await addProjectNotificationRecipientForApp({
                projectId,
                email,
                label: label || undefined,
              });
              setMessage(`Lead alerts will now also go to ${response.recipient.email}.`);
              setEmail("");
              setLabel("");
              router.refresh();
            } catch (submitError) {
              setError(
                submitError instanceof Error
                  ? submitError.message
                  : "The alert recipient could not be saved right now.",
              );
            }
          });
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--portal-muted)]">
            Lead alert routing
          </p>
          <p className="mt-2 text-sm text-[var(--portal-muted)]">
            Add builder or sales emails here. Naya stays on the alert chain automatically.
          </p>
        </div>

        <div className="grid gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="builder@company.com"
            className="w-full rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-3 text-sm text-[var(--portal-foreground)] outline-none transition placeholder:text-[var(--portal-muted)] focus:border-[var(--portal-accent-border)]"
          />
          <input
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Optional label, like Builder sales"
            className="w-full rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-3 text-sm text-[var(--portal-foreground)] outline-none transition placeholder:text-[var(--portal-muted)] focus:border-[var(--portal-accent-border)]"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-badge-bg)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-badge-text)] transition hover:bg-[var(--portal-surface)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving" : "Add Alert Recipient"}
        </button>

        {message ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
