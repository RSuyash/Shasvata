import Link from "next/link";
import type { ReactNode } from "react";
import { buildAuthRoute, ROUTES } from "@/lib/routes";
import { AuthThemeToggle } from "./auth-theme-toggle";

type AuthMode = "sign-up" | "sign-in";

type AuthShellProps = {
  activeMode?: AuthMode;
  title: string;
  description: string;
  redirectPath?: string;
  extraQueryParams?: {
    inviteSelector?: string;
    inviteVerifier?: string;
    inviteEmail?: string;
  };
  showModeToggle?: boolean;
  socialSection?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

function buildModeHref(
  mode: AuthMode,
  redirectPath?: string,
  extraQueryParams?: AuthShellProps["extraQueryParams"],
) {
  return buildAuthRoute({
    mode,
    redirect:
      redirectPath && redirectPath !== ROUTES.dashboard.root ? redirectPath : undefined,
    inviteSelector: extraQueryParams?.inviteSelector,
    inviteVerifier: extraQueryParams?.inviteVerifier,
    inviteEmail: extraQueryParams?.inviteEmail,
  });
}

export function AuthShell({
  activeMode = "sign-in",
  title,
  description,
  redirectPath = ROUTES.dashboard.root,
  extraQueryParams,
  showModeToggle = true,
  socialSection,
  footer,
  children,
}: AuthShellProps) {
  return (
    <main className="auth-stage relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-10">
      <div className="relative z-10 flex min-h-[calc(100vh-2rem)] items-center justify-center">
        <div className="w-full max-w-[520px]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.28em]" style={{ color: "var(--muted)" }}>
              Shasvata Workspace
            </p>
            <AuthThemeToggle />
          </div>

          <section
            className="relative overflow-hidden rounded-[34px] border p-4 shadow-[var(--surface-shadow)] sm:p-6"
            style={{
              background: "var(--surface)",
              borderColor: "var(--surface-border)",
              backdropFilter: "blur(30px)",
            }}
          >
            <div
              className="absolute inset-x-0 bottom-0 h-32"
              style={{
                background:
                  "radial-gradient(circle at 50% 100%, var(--auth-glow), transparent 56%)",
              }}
            />

            <div className="relative z-10 space-y-6">
              <div className="flex items-start justify-between gap-4">
                {showModeToggle ? (
                  <div
                    className="inline-flex rounded-full border p-1"
                    style={{
                      background: "var(--surface-strong)",
                      borderColor: "var(--divider)",
                    }}
                  >
                    {(["sign-up", "sign-in"] as const).map((mode) => {
                      const active = activeMode === mode;
                      return (
                        <Link
                          key={mode}
                          href={buildModeHref(mode, redirectPath, extraQueryParams)}
                          className="rounded-full px-5 py-3 text-sm font-semibold transition"
                          style={{
                            color: active ? "var(--foreground)" : "var(--muted)",
                            background: active ? "var(--field-bg)" : "transparent",
                            boxShadow: active
                              ? "0 18px 32px rgba(15, 23, 42, 0.12)"
                              : "none",
                          }}
                        >
                          {mode === "sign-up" ? "Sign up" : "Sign in"}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div />
                )}

                <Link
                  href="https://shasvata.com"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border text-2xl leading-none transition"
                  style={{
                    background: "var(--theme-button-bg)",
                    borderColor: "var(--theme-button-border)",
                    color: "var(--foreground)",
                  }}
                >
                  ×
                </Link>
              </div>

              <div className="space-y-3 px-1">
                <h1 className="font-display text-4xl tracking-[-0.05em] sm:text-[3.2rem]">
                  {title}
                </h1>
                <p
                  className="max-w-[30rem] text-sm leading-7 sm:text-[15px]"
                  style={{ color: "var(--muted)" }}
                >
                  {description}
                </p>
              </div>

              {socialSection ? (
                <div className="space-y-4 px-1 pb-2">
                  {socialSection}
                  <div className="flex items-center gap-4 pt-2">
                    <span className="h-px flex-1" style={{ background: "var(--divider)" }} />
                    <span
                      className="text-[11px] uppercase tracking-[0.2em] font-medium"
                      style={{ color: "var(--muted)" }}
                    >
                      or continue with email
                    </span>
                    <span className="h-px flex-1" style={{ background: "var(--divider)" }} />
                  </div>
                </div>
              ) : null}

              <div className="space-y-4 px-1">{children}</div>

              <div
                className="px-1 text-center text-xs leading-6"
                style={{ color: "var(--muted)" }}
              >
                {footer ?? (
                  <p>
                    By continuing, you agree to our Terms &amp; Service and secure workspace
                    access policy.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
