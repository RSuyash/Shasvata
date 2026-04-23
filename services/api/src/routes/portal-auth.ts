import { Router, type Response } from "express";
import {
  consumeEmailVerification,
  consumePortalMagicLink,
  requestPasswordReset,
  requestPortalMagicLink,
  resetPassword,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} from "../services/landing-platform-runtime.js";
import {
  PORTAL_SESSION_COOKIE,
  getPortalCookieOptions,
} from "./portal-session-cookie.js";

export const portalAuthRouter = Router();

function sendAuthError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Authentication failed.";

  if (message === "Invalid email or password.") {
    res.status(401).json({ error: message });
    return true;
  }

  if (message === "Invalid Google ID token.") {
    res.status(401).json({ error: message });
    return true;
  }

  if (
    message === "Magic link is invalid or expired." ||
    message === "Email verification link is invalid or expired." ||
    message === "Password reset link is invalid or expired." ||
    message === "Project invite is invalid or expired." ||
    message === "Project invite email mismatch." ||
    message === "Portal user is not active." ||
    message === "Google account email is not verified."
  ) {
    res.status(400).json({ error: message });
    return true;
  }

  if (
    message === "First name, email, and password are required." ||
    message === "A new password is required."
  ) {
    res.status(400).json({ error: message });
    return true;
  }

  if (message === "An account with this email already exists.") {
    res.status(409).json({ error: message });
    return true;
  }

  return false;
}

function setPortalSessionCookie(res: Response, session: { id: string; expiresAt: Date }) {
  res.cookie(
    PORTAL_SESSION_COOKIE,
    session.id,
    getPortalCookieOptions(session.expiresAt),
  );
}

portalAuthRouter.post("/sign-up", async (req, res, next) => {
  try {
    const result = await signUpWithPassword({
      firstName: String(req.body?.firstName ?? ""),
      lastName: String(req.body?.lastName ?? ""),
      email: String(req.body?.email ?? ""),
      phone: typeof req.body?.phone === "string" ? req.body.phone : undefined,
      password: String(req.body?.password ?? ""),
      inviteSelector:
        typeof req.body?.inviteSelector === "string" ? req.body.inviteSelector : undefined,
      inviteVerifier:
        typeof req.body?.inviteVerifier === "string" ? req.body.inviteVerifier : undefined,
    });

    if ("authenticated" in result && result.authenticated) {
      setPortalSessionCookie(res, result.session);
      res.status(200).json({
        authenticated: true,
        ...(result.redirectPath ? { redirectPath: result.redirectPath } : {}),
        portalUser: {
          id: result.portalUser.id,
          email: result.portalUser.email,
        },
      });
      return;
    }

    res.status(202).json(result);
  } catch (error) {
    if (sendAuthError(res, error)) {
      return;
    }
    next(error);
  }
});

portalAuthRouter.post("/sign-in", async (req, res, next) => {
  try {
    const result = await signInWithPassword({
      email: String(req.body?.email ?? ""),
      password: String(req.body?.password ?? ""),
      inviteSelector:
        typeof req.body?.inviteSelector === "string" ? req.body.inviteSelector : undefined,
      inviteVerifier:
        typeof req.body?.inviteVerifier === "string" ? req.body.inviteVerifier : undefined,
    });

    setPortalSessionCookie(res, result.session);

    res.status(200).json({
      authenticated: true,
      ...(result.redirectPath ? { redirectPath: result.redirectPath } : {}),
      portalUser: {
        id: result.portalUser.id,
        email: result.portalUser.email,
      },
    });
  } catch (error) {
    if (sendAuthError(res, error)) {
      return;
    }
    next(error);
  }
});

portalAuthRouter.post("/verify-email/consume", async (req, res, next) => {
  try {
    const result = await consumeEmailVerification({
      selector: String(req.body?.selector ?? ""),
      verifier: String(req.body?.verifier ?? ""),
    });

    setPortalSessionCookie(res, result.session);

    res.status(200).json({
      authenticated: true,
      portalUser: {
        id: result.portalUser.id,
        email: result.portalUser.email,
      },
    });
  } catch (error) {
    if (sendAuthError(res, error)) {
      return;
    }
    next(error);
  }
});

portalAuthRouter.post("/password/forgot", async (req, res, next) => {
  try {
    const result = await requestPasswordReset({
      email: String(req.body?.email ?? ""),
    });

    res.status(202).json(result);
  } catch (error) {
    if (sendAuthError(res, error)) {
      return;
    }
    next(error);
  }
});

portalAuthRouter.post("/password/reset", async (req, res, next) => {
  try {
    const result = await resetPassword({
      selector: String(req.body?.selector ?? ""),
      verifier: String(req.body?.verifier ?? ""),
      password: String(req.body?.password ?? ""),
    });

    setPortalSessionCookie(res, result.session);

    res.status(200).json({
      authenticated: true,
      portalUser: {
        id: result.portalUser.id,
        email: result.portalUser.email,
      },
    });
  } catch (error) {
    if (sendAuthError(res, error)) {
      return;
    }
    next(error);
  }
});

portalAuthRouter.post("/google", async (req, res, next) => {
  try {
    const result = await signInWithGoogle({
      idToken: String(req.body?.idToken ?? ""),
      inviteSelector:
        typeof req.body?.inviteSelector === "string" ? req.body.inviteSelector : undefined,
      inviteVerifier:
        typeof req.body?.inviteVerifier === "string" ? req.body.inviteVerifier : undefined,
    });

    setPortalSessionCookie(res, result.session);

    res.status(200).json({
      authenticated: true,
      ...(result.redirectPath ? { redirectPath: result.redirectPath } : {}),
      portalUser: {
        id: result.portalUser.id,
        email: result.portalUser.email,
      },
    });
  } catch (error) {
    if (sendAuthError(res, error)) {
      return;
    }
    next(error);
  }
});

portalAuthRouter.post("/magic-links", async (req, res, next) => {
  try {
    const result = await requestPortalMagicLink({
      email: String(req.body?.email ?? ""),
      redirectPath:
        typeof req.body?.redirectPath === "string" ? req.body.redirectPath : undefined,
    });
    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
});

portalAuthRouter.post("/magic-links/consume", async (req, res, next) => {
  try {
    const result = await consumePortalMagicLink({
      selector: String(req.body?.selector ?? ""),
      verifier: String(req.body?.verifier ?? ""),
    });

    setPortalSessionCookie(res, result.session);

    res.status(200).json({
      authenticated: true,
      redirectPath: result.redirectPath,
      portalUser: {
        id: result.portalUser.id,
        email: result.portalUser.email,
      },
    });
  } catch (error) {
    if (sendAuthError(res, error)) {
      return;
    }
    next(error);
  }
});
