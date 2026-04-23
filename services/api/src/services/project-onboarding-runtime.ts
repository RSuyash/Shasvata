import { createProjectOnboardingRepository } from "../repositories/project-onboarding.js";
import {
  createProjectOnboardingService,
  type ProjectOnboardingRepository,
} from "./project-onboarding.js";

const projectOnboardingService = createProjectOnboardingService(
  createProjectOnboardingRepository() satisfies ProjectOnboardingRepository,
  {
    now: () => new Date(),
  },
);

export async function resolveProjectOnboardingSession(input: {
  portalUserId: string;
  cartId: string;
}) {
  return projectOnboardingService.resolveProjectOnboardingSession(input);
}

export async function getProjectOnboardingSession(input: {
  portalUserId: string;
  sessionId: string;
}) {
  return projectOnboardingService.getProjectOnboardingSession(input);
}

export async function saveProjectOnboardingSession(input: {
  portalUserId: string;
  sessionId: string;
  intake: Record<string, unknown>;
  lastCompletedStep?: string | null;
}) {
  return projectOnboardingService.saveProjectOnboardingSession(input);
}

export async function submitProjectOnboardingSession(input: {
  portalUserId: string;
  sessionId: string;
}) {
  return projectOnboardingService.submitProjectOnboardingSession(input);
}
