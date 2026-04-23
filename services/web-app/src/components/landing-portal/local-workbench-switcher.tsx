"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { LocalWorkbenchPersona } from "@/lib/local-portal-workbench";

const personaOptions: Array<{
  persona: LocalWorkbenchPersona;
  label: string;
  description: string;
}> = [
  {
    persona: "owner",
    label: "Owner",
    description: "Full client access with billing, leads, and settings.",
  },
  {
    persona: "viewer",
    label: "Viewer",
    description: "Read-only client access with masked contact details.",
  },
  {
    persona: "operator",
    label: "Operator",
    description: "Internal Naya access with recovery and deleted states.",
  },
];

export function LocalWorkbenchSwitcher(props: {
  currentPersona?: LocalWorkbenchPersona | null;
  redirectPath?: string;
  variant?: "banner" | "card";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const variant = props.variant ?? "banner";

  async function setPersona(persona: LocalWorkbenchPersona) {
    setMessage(null);

    const response = await fetch("/api/local-workbench", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "set-persona",
        persona,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error || "Unable to switch local persona right now.");
    }
  }

  const wrapperClassName =
    variant === "card"
      ? "rounded-[24px] border p-5"
      : "rounded-[18px] border px-4 py-3";

  return (
    <div
      className={wrapperClassName}
      style={{
        borderColor: "var(--portal-border)",
        background:
          variant === "card"
            ? "var(--surface-strong)"
            : "var(--portal-surface-soft)",
      }}
    >
      <div className={variant === "card" ? "space-y-4" : "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"}>
        <div className="min-w-0">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--portal-badge-text)" }}
          >
            Local sandbox mode
          </p>
          <p
            className="mt-1 text-sm leading-6"
            style={{ color: "var(--foreground-muted)" }}
          >
            Switch personas instantly while keeping the dashboard on seeded local data.
          </p>
          {props.currentPersona ? (
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              Current persona:{" "}
              <span style={{ color: "var(--foreground)" }}>
                {personaOptions.find((entry) => entry.persona === props.currentPersona)?.label ??
                  props.currentPersona}
              </span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {personaOptions.map((option) => {
            const isActive = option.persona === props.currentPersona;

            return (
              <button
                key={option.persona}
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    try {
                      await setPersona(option.persona);
                      setMessage(`${option.label} persona ready locally.`);
                      if (props.redirectPath) {
                        router.replace(props.redirectPath);
                        return;
                      }

                      router.replace(pathname || "/dashboard");
                      router.refresh();
                    } catch (error) {
                      setMessage(
                        error instanceof Error
                          ? error.message
                          : "Unable to switch local persona.",
                      );
                    }
                  });
                }}
                className="rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:opacity-60"
                style={{
                  borderColor: isActive
                    ? "var(--portal-accent-border)"
                    : "var(--portal-border)",
                  background: isActive
                    ? "var(--portal-badge-bg)"
                    : "var(--portal-surface)",
                  color: isActive
                    ? "var(--portal-badge-text)"
                    : "var(--portal-foreground)",
                }}
                title={option.description}
              >
                {isPending && isActive ? "Switching..." : option.label}
              </button>
            );
          })}
        </div>
      </div>

      {message ? (
        <p
          className="mt-3 text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
