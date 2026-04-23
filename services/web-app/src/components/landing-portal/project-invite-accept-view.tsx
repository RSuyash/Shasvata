"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  consumeProjectInviteForApp,
  type PortalSessionResponse,
  type ProjectInviteContext,
} from "@/lib/landing-portal";
import { buildAuthRoute, ROUTES } from "@/lib/routes";

// Icon components for the auth card
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export function ProjectInviteAcceptView({
  selector,
  verifier,
  inviteContext,
  session,
}: {
  selector: string;
  verifier: string;
  inviteContext: ProjectInviteContext;
  session: PortalSessionResponse | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const invitedEmail = inviteContext.invite.email;
  const isLoggedIn = Boolean(session);
  const hasMatchingSession = session?.portalUser.email === invitedEmail;

  useEffect(() => {
    if (!hasMatchingSession) return;

    startTransition(async () => {
      try {
        await consumeProjectInviteForApp({ selector, verifier });
        router.replace(ROUTES.dashboard.project(inviteContext.project.id));
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "The project invite could not be accepted.",
        );
      }
    });
  }, [hasMatchingSession, inviteContext.project.id, router, selector, startTransition, verifier]);

  const currentPath = ROUTES.auth.inviteAccept(selector, verifier);
  const signInHref = buildAuthRoute({ mode: "sign-in", redirect: currentPath, inviteSelector: selector, inviteVerifier: verifier, inviteEmail: invitedEmail });
  const signUpHref = buildAuthRoute({ mode: "sign-up", redirect: currentPath, inviteSelector: selector, inviteVerifier: verifier, inviteEmail: invitedEmail });

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-gray-900 selection:text-white">

      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden relative">
        {/* Subtle Top Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900"></div>

        <div className="p-8">

          {/* Visual Header Connection */}
          <div className="flex justify-center items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Project Invitation
            </h1>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              You've been invited to join <span className="font-semibold text-gray-900">{inviteContext.project.name}</span>.
            </p>
          </div>

          {/* Data Card */}
          <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Invited Email</span>
              <span className="text-sm font-medium text-gray-900">{invitedEmail}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Project</span>
              <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{inviteContext.project.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Access Level</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                {inviteContext.invite.role}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm font-medium text-red-800 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Authentication & Routing Logic */}
          <div className="mt-8">
            {hasMatchingSession ? (
              <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <Spinner />
                <p className="mt-4 text-sm font-semibold text-gray-900">Verifying Identity</p>
                <p className="mt-1 text-xs text-gray-500">Accepting invite and preparing workspace...</p>
              </div>
            ) : isLoggedIn ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p className="text-sm font-bold text-amber-900">Account Mismatch</p>
                </div>
                <p className="text-sm leading-relaxed text-amber-800">
                  You are signed in as <span className="font-semibold">{session?.portalUser.email}</span>, but this invite requires <span className="font-semibold">{invitedEmail}</span>.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <Link href={signInHref} className="flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                    Switch to invited account
                  </Link>
                  <Link href={ROUTES.dashboard.projects} className="flex w-full items-center justify-center rounded-lg bg-white border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href={signUpHref} className="flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                  Accept Invite & Create Account
                </Link>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-500">Already have an account?</span></div>
                </div>
                <Link href={signInHref} className="flex w-full items-center justify-center rounded-lg bg-white border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                  Sign in
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

    </main>
  );
}
