"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOutPortalSessionForApp } from "@/lib/landing-portal";

type SignOutButtonProps = {
  variant?: "default" | "clientPortal" | "clientPortalSubtle";
  className?: string;
};

export function SignOutButton({
  variant = "default",
  className = "",
}: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const buttonClassName =
    variant === "clientPortal"
      ? "inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface-soft)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-badge-bg)] disabled:cursor-not-allowed disabled:opacity-60"
      : variant === "clientPortalSubtle"
        ? "inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--portal-muted)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)] hover:text-[var(--portal-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
      : "inline-flex items-center justify-center rounded-full border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 transition hover:border-amber-200/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      type="button"
      disabled={isPending}
      className={`${buttonClassName} ${className}`.trim()}
      onClick={() => {
        startTransition(async () => {
          await signOutPortalSessionForApp();
          router.replace("/auth/sign-in");
        });
      }}
    >
      {isPending ? "Signing Out" : "Sign Out"}
    </button>
  );
}
