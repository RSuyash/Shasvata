"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inviteProjectMemberForApp, type ProjectInvite } from "@/lib/landing-portal";
import { isLocalPortalWorkbenchClientEnabled } from "@/lib/local-portal-workbench";

type InviteMemberFormProps = {
  projectId: string;
  variant?: "default" | "clientPortal";
  onInviteCreated?: (invite: ProjectInvite) => void;
};

export function InviteMemberForm({
  projectId,
  variant = "default",
  onInviteCreated,
}: InviteMemberFormProps) {
  const router = useRouter();
  const sandboxEnabled = isLocalPortalWorkbenchClientEnabled();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"OWNER" | "VIEWER">("VIEWER");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formClassName =
    variant === "clientPortal"
      ? "mt-4 space-y-4 rounded-[24px] border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] p-5"
      : "mt-4 space-y-4 rounded-[22px] border border-white/8 bg-black/20 p-4";
  const inputClassName =
    variant === "clientPortal"
      ? "w-full rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-3 text-sm text-[var(--portal-foreground)] outline-none transition placeholder:text-[var(--portal-muted)] focus:border-[var(--portal-accent-border)]"
      : "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/8";
  const selectClassName =
    variant === "clientPortal"
      ? "w-full rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-3 text-sm text-[var(--portal-foreground)] outline-none transition focus:border-[var(--portal-accent-border)]"
      : "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-white/8";
  const buttonClassName =
    variant === "clientPortal"
      ? "inline-flex w-full items-center justify-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-badge-bg)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-badge-text)] transition hover:bg-[var(--portal-surface)] disabled:cursor-not-allowed disabled:opacity-60"
      : "inline-flex w-full items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/12 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form
      className={formClassName}
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        setError(null);

        startTransition(async () => {
          try {
            const response = await inviteProjectMemberForApp({
              projectId,
              email,
              fullName,
              role,
            });
            setMessage(`Invitation sent to ${response.invite.email}.`);
            setEmail("");
            setFullName("");
            setRole("VIEWER");
            onInviteCreated?.(response.invite);
            if (!sandboxEnabled) {
              router.refresh();
            }
          } catch (inviteError) {
            setError(
              inviteError instanceof Error
                ? inviteError.message
                : "The member could not be invited right now.",
            );
          }
        });
      }}
    >
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
        Invite another project user
      </p>

      <div className="grid gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="viewer@client.com"
          className={inputClassName}
        />
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Optional full name"
          className={inputClassName}
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value === "OWNER" ? "OWNER" : "VIEWER")}
          className={selectClassName}
        >
          <option value="VIEWER">Viewer</option>
          <option value="OWNER">Owner</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={buttonClassName}
      >
        {isPending ? "Inviting" : "Invite Member"}
      </button>

      {message ? (
        <p
          className={
            variant === "clientPortal"
              ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100"
              : "rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
          }
        >
          {message}
        </p>
      ) : null}

      {error ? (
        <p
          className={
            variant === "clientPortal"
              ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100"
              : "rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
          }
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
