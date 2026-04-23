"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addProjectNotificationRecipientForApp,
  removeProjectNotificationRecipientForApp,
  type ProjectNotificationRecipient,
} from "@/lib/landing-portal";

// Simple spinner for inline loading states
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export function ProjectNotificationSettingsView({
  projectId,
  recipients,
}: {
  projectId: string;
  recipients: ProjectNotificationRecipient[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  function runTask(task: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await task();
        router.refresh();
      } catch (taskError) {
        setError(taskError instanceof Error ? taskError.message : "Settings update failed.");
      }
    });
  }

  return (
    <div className="flex flex-col h-full flex-1">
      {/* Header Section */}
      <div className="px-6 py-6 border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--portal-foreground)]">Emails & Alerts</h2>
            <p className="text-sm text-[var(--portal-muted)] mt-1">Manage who receives notifications when new leads arrive.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--portal-foreground)] bg-[var(--portal-surface)] border border-[var(--portal-border)] px-3 py-1.5 rounded-md shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[16px] text-emerald-500">mark_email_unread</span>
            {recipients.length} Active {recipients.length === 1 ? 'Inbox' : 'Inboxes'}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 bg-[var(--portal-surface)]">

        {/* Add New Recipient Form */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--portal-muted)] mb-3">Add Destination</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--portal-muted)] material-symbols-outlined text-[18px] transition-colors group-focus-within:text-[var(--portal-foreground)]">alternate_email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="sales@client.local"
                className="h-10 w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] pl-10 pr-4 text-sm font-mono text-[var(--portal-foreground)] placeholder-[var(--portal-muted)]/50 outline-none transition-all focus:border-[var(--portal-foreground)] focus:ring-1 focus:ring-[var(--portal-foreground)] shadow-sm"
              />
            </div>
            <div className="relative flex-1 group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--portal-muted)] material-symbols-outlined text-[18px] transition-colors group-focus-within:text-[var(--portal-foreground)]">label</span>
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="e.g. Main Sales Team"
                className="h-10 w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] pl-10 pr-4 text-sm text-[var(--portal-foreground)] placeholder-[var(--portal-muted)]/50 outline-none transition-all focus:border-[var(--portal-foreground)] focus:ring-1 focus:ring-[var(--portal-foreground)] shadow-sm"
              />
            </div>

            <button
              type="button"
              disabled={isPending || !email.trim()}
              onClick={() =>
                runTask(async () => {
                  await addProjectNotificationRecipientForApp({ projectId, email, label });
                  setEmail("");
                  setLabel("");
                })
              }
              className="h-10 shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--portal-foreground)] px-6 text-[11px] font-bold uppercase tracking-widest text-[var(--portal-surface)] transition-all hover:opacity-90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && email.trim() ? <Spinner /> : "Add Email"}
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] text-rose-600 dark:text-rose-400">error</span>
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-[var(--portal-border)]" />

        {/* Active Inboxes List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--portal-muted)] mb-3">Active Routing</h4>

          {recipients.length > 0 ? (
            <ul className="divide-y divide-[var(--portal-border)] rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] overflow-hidden">
              {recipients.map((recipient) => (
                <li
                  key={recipient.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-[var(--portal-surface)] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--portal-surface)] border border-[var(--portal-border)] text-[var(--portal-muted)] shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <p className="text-sm font-semibold text-[var(--portal-foreground)] truncate">
                        {recipient.label || "System Target"}
                      </p>
                      <p className="text-xs font-mono text-[var(--portal-muted)] truncate">{recipient.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => runTask(async () => {
                      await removeProjectNotificationRecipientForApp({ projectId, recipientId: recipient.id });
                    })}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-[var(--portal-muted)] hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100"
                    title="Remove recipient"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-[var(--portal-border)] bg-[var(--portal-surface-soft)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--portal-surface)] border border-[var(--portal-border)] text-[var(--portal-muted)] mb-4">
                <span className="material-symbols-outlined text-[24px]">link_off</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--portal-foreground)]">No active inboxes</h3>
              <p className="mt-1 text-xs text-[var(--portal-muted)] max-w-xs mx-auto">
                Add an email destination above to start routing live lead notifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
