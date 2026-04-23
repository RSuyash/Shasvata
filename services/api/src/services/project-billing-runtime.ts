import { createLandingPlatformRepository } from "../repositories/landing-platform.js";
import { createProjectBillingRepository } from "../repositories/project-billing.js";
import {
  createProjectBillingService,
  type ProjectBillingService,
} from "./project-billing.js";
import type {
  CreateProjectBillingSnapshotInput,
  ProjectBillingCheckoutIdentityUpdateInput,
  ProjectBillingConfigUpdateInput,
  ProjectBillingPreviewInput,
  SupersedeProjectBillingSnapshotInput,
  UpdateProjectBillingSnapshotLinkageInput,
} from "./project-billing-types.js";

const projectBillingService: ProjectBillingService = createProjectBillingService(
  createLandingPlatformRepository(),
  createProjectBillingRepository(),
  {
    now: () => new Date(),
  },
);

export async function getProjectBillingConfig(input: {
  portalUserId: string;
  projectId: string;
}) {
  return projectBillingService.getProjectBillingConfig(input);
}

export async function updateProjectBillingConfig(
  input: ProjectBillingConfigUpdateInput,
) {
  return projectBillingService.updateProjectBillingConfig(input);
}

export async function updateProjectBillingCheckoutIdentity(
  input: ProjectBillingCheckoutIdentityUpdateInput,
) {
  return projectBillingService.updateProjectBillingCheckoutIdentity(input);
}

export async function previewProjectBillingOffer(
  input: ProjectBillingPreviewInput,
) {
  return projectBillingService.previewProjectBillingOffer(input);
}

export async function createProjectBillingSnapshot(
  input: CreateProjectBillingSnapshotInput,
) {
  return projectBillingService.createProjectBillingSnapshot(input);
}

export async function supersedeProjectBillingSnapshot(
  input: SupersedeProjectBillingSnapshotInput,
) {
  return projectBillingService.supersedeProjectBillingSnapshot(input);
}

export async function updateProjectBillingSnapshotLinkage(
  input: UpdateProjectBillingSnapshotLinkageInput,
) {
  return projectBillingService.updateProjectBillingSnapshotLinkage(input);
}

export async function getProjectBillingDetail(input: {
  portalUserId: string;
  projectId: string;
}) {
  return projectBillingService.getProjectBillingDetail(input);
}

export async function getPortfolioBillingDetail(input: {
  portalUserId: string;
}) {
  return projectBillingService.getPortfolioBillingDetail(input);
}
