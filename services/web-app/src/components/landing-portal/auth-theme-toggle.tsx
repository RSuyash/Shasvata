"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";
type ThemeToggleVariant = "default" | "clientPortal";

const STORAGE_KEY = "shasvata-auth-theme";
const EVENT_NAME = "shasvata-theme-change";

function readTheme(): ThemeMode {
  if (typeof document === "undefined") {
    return "dark";
  }

  const current = document.documentElement.dataset.theme;
  return current === "light" ? "light" : "dark";
}

export function AuthThemeToggle({
  variant = "default",
  className = "",
}: {
  variant?: ThemeToggleVariant;
  className?: string;
}) {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? "Dark mode" : "Light mode";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={() => {
        const resolved = nextTheme;
        document.documentElement.dataset.theme = resolved;
        window.localStorage.setItem(STORAGE_KEY, resolved);
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: resolved }));
        setTheme(resolved);
      }}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition ${
        variant === "clientPortal" ? "client-portal-tone-transition" : ""
      } ${className}`.trim()}
      style={{
        background:
          variant === "clientPortal"
            ? "var(--portal-control)"
            : "var(--theme-button-bg)",
        borderColor:
          variant === "clientPortal"
            ? "var(--portal-border)"
            : "var(--theme-button-border)",
        color:
          variant === "clientPortal"
            ? "var(--portal-foreground)"
            : "var(--foreground)",
      }}
    >
      <span
        className="inline-flex h-2.5 w-2.5 rounded-full"
        style={{
          background: theme === "dark" ? "#f8fafc" : "#2a6df6",
          boxShadow:
            theme === "dark"
              ? "0 0 18px rgba(255,255,255,0.45)"
              : "0 0 18px rgba(42,109,246,0.42)",
        }}
      />
      {label}
    </button>
  );
}

export function subscribeToThemeChange(listener: (theme: ThemeMode) => void) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ThemeMode>;
    listener(customEvent.detail === "light" ? "light" : "dark");
  };

  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

export function getCurrentThemeMode(): ThemeMode {
  return readTheme();
}
