export const ROUTES = {
  public: {
    home: "/",
    products: "/products",
    contact: "/contact",
    terms: "/terms",
    privacy: "/privacy",
    refunds: "/refunds-cancellations",
  },
  auth: {
    signIn: "/auth/sign-in",
    forgotPassword: "/auth/forgot-password",
    inviteAccept: (selector: string, verifier: string) => `/invite/${selector}/${verifier}`,
  },
  dashboard: {
    root: "/dashboard",
    products: "/dashboard/products",
    billing: "/dashboard/billing",
    projects: "/dashboard/projects",
    settings: "/dashboard/settings",
    onboarding: (sessionId: string) => `/dashboard/onboarding/${sessionId}`,
    project: (projectId: string) => `/dashboard/projects/${projectId}`,
    projectLeads: (projectId: string) => `/dashboard/projects/${projectId}/leads`,
    projectSettings: (projectId: string) => `/dashboard/projects/${projectId}/settings`,
    projectBilling: (projectId: string) =>
      `/dashboard/projects/${projectId}/billing`,
    projectAnalytics: (projectId: string) =>
      `/dashboard/projects/${projectId}/analytics`,
  },
  legacy: {
    projects: "/projects",
  },
} as const;

export type AuthRouteOptions = {
  mode?: "sign-in" | "sign-up";
  redirect?: string;
  inviteSelector?: string;
  inviteVerifier?: string;
  inviteEmail?: string;
};

export function buildAuthRoute(options: AuthRouteOptions = {}) {
  const params = new URLSearchParams();

  if (options.mode) {
    params.set("mode", options.mode);
  }
  if (options.redirect) {
    params.set("redirect", options.redirect);
  }
  if (options.inviteSelector) {
    params.set("inviteSelector", options.inviteSelector);
  }
  if (options.inviteVerifier) {
    params.set("inviteVerifier", options.inviteVerifier);
  }
  if (options.inviteEmail) {
    params.set("inviteEmail", options.inviteEmail);
  }

  const query = params.toString();
  return query ? `${ROUTES.auth.signIn}?${query}` : ROUTES.auth.signIn;
}

export function signInRedirect(
  target: string,
  options: Omit<AuthRouteOptions, "mode" | "redirect"> = {},
) {
  return buildAuthRoute({
    redirect: target,
    ...options,
  });
}
