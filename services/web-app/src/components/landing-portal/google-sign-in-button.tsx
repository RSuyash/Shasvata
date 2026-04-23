"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AuthFeedback } from "./auth-form-primitives";
import {
  getCurrentThemeMode,
  subscribeToThemeChange,
} from "./auth-theme-toggle";
import { signInWithGoogleForApp } from "@/lib/landing-portal";
import { ROUTES } from "@/lib/routes";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (input: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Google sign-in assets could not be loaded."));

    if (!existing) {
      document.head.appendChild(script);
    }
  });

  return googleScriptPromise;
}

type GoogleSignInButtonProps = {
  clientId?: string;
  redirectPath?: string;
  inviteSelector?: string;
  inviteVerifier?: string;
};

export function GoogleSignInButton({
  clientId = "",
  redirectPath = ROUTES.dashboard.projects,
  inviteSelector,
  inviteVerifier,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    setThemeMode(getCurrentThemeMode());
    return subscribeToThemeChange(setThemeMode);
  }, []);

  useEffect(() => {
    if (!clientId || !containerRef.current) {
      return;
    }

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) {
          return;
        }

        containerRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            const credential = response.credential;
            if (!credential) {
              setError("Google did not return a usable sign-in token.");
              return;
            }

            startTransition(async () => {
              try {
                const result = await signInWithGoogleForApp({
                  idToken: credential,
                  inviteSelector,
                  inviteVerifier,
                });
                router.replace(result.redirectPath ?? redirectPath);
                router.refresh();
              } catch (signInError) {
                setError(
                  signInError instanceof Error
                    ? signInError.message
                    : "Google sign-in is unavailable right now.",
                );
              }
            });
          },
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          theme: themeMode === "dark" ? "filled_black" : "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          text: "continue_with",
          width: 400,
        });
      })
      .catch((scriptError) => {
        setError(
          scriptError instanceof Error
            ? scriptError.message
            : "Google sign-in assets could not be loaded.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, inviteSelector, inviteVerifier, redirectPath, router, themeMode]);

  return (
    <div className="space-y-3">
      <div
        className="flex min-h-[52px] w-full items-center justify-center rounded-3xl border px-1 py-1 transition-all"
        style={{
          background: "var(--surface-strong)",
          borderColor: "var(--divider)",
        }}
      >
        {clientId ? (
          <div ref={containerRef} className="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full overflow-hidden rounded-full" />
        ) : (
          <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            Google setup pending
          </span>
        )}
      </div>

      {isPending ? <AuthFeedback tone="neutral">Finalizing Google sign-in...</AuthFeedback> : null}
      {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}
    </div>
  );
}
