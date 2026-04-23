import type { CSSProperties, ReactNode } from "react";

export const authLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.24em]";
export const authInputClass =
  "w-full rounded-[18px] border px-4 py-3.5 text-[15px] outline-none transition focus:scale-[1.01]";
export const authPrimaryButtonClass =
  "inline-flex w-full items-center justify-center rounded-[18px] border px-5 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
export const authSecondaryButtonClass =
  "inline-flex w-full items-center justify-center rounded-[18px] border px-5 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export const authInputStyle: CSSProperties = {
  background: "var(--field-bg)",
  borderColor: "var(--field-border)",
  color: "var(--field-text)",
};

export const authPrimaryButtonStyle: CSSProperties = {
  background: "var(--accent)",
  borderColor: "var(--accent-border)",
  color: "var(--background)",
  boxShadow: "0 24px 60px var(--shadow-accent)",
};

export const authSecondaryButtonStyle: CSSProperties = {
  background: "var(--surface-strong)",
  borderColor: "var(--divider)",
  color: "var(--foreground)",
};

type AuthFeedbackProps = {
  tone: "success" | "error" | "neutral";
  children: ReactNode;
};

export function AuthFeedback({ tone, children }: AuthFeedbackProps) {
  if (tone === "success") {
    return (
      <p
        className="rounded-[18px] border px-4 py-3 text-sm leading-6"
        style={{
          background: "var(--success-bg)",
          borderColor: "var(--success-border)",
          color: "var(--success-text)",
        }}
      >
        {children}
      </p>
    );
  }

  if (tone === "error") {
    return (
      <p
        className="rounded-[18px] border px-4 py-3 text-sm leading-6"
        style={{
          background: "var(--danger-bg)",
          borderColor: "var(--danger-border)",
          color: "var(--danger-text)",
        }}
      >
        {children}
      </p>
    );
  }

  return (
    <p
      className="rounded-[18px] border px-4 py-3 text-sm leading-6"
      style={{
        background: "var(--surface-strong)",
        borderColor: "var(--divider)",
        color: "var(--foreground)",
      }}
    >
      {children}
    </p>
  );
}
