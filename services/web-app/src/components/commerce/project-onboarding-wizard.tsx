"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientPortalKpiCard } from "@/components/client-portal/client-portal-kpi-card";
import {
  ClientPortalSectionCard,
  ClientPortalStatusPill,
} from "@/components/client-portal/client-portal-panels";
import {
  formatPortalDate,
  saveProjectOnboardingForApp,
  submitProjectOnboardingForApp,
  type ProjectOnboardingSession,
} from "@/lib/landing-portal";
import {
  coerceProjectOnboardingDraft,
  serializeProjectOnboardingDraft,
  type ProjectOnboardingDraft,
} from "@/lib/project-onboarding-state";
import { ROUTES } from "@/lib/routes";
import { formatMoneyMinor } from "@/lib/utils";

type OnboardingStepKey = "overview" | "brand" | "sections" | "compliance";

const steps: Array<{
  key: OnboardingStepKey;
  label: string;
  description: string;
}> = [
  {
    key: "overview",
    label: "Overview",
    description: "Project basics, launch goal, and the commercial anchor.",
  },
  {
    key: "brand",
    label: "Brand",
    description: "Assets, references, and the tone we should actually build to.",
  },
  {
    key: "sections",
    label: "Sections",
    description: "The page structure, hero copy, CTA, and extra scope decisions.",
  },
  {
    key: "compliance",
    label: "Compliance",
    description: "Legal, approvals, addresses, and the details ops should not chase later.",
  },
];

const fieldClassName =
  "mt-2 w-full rounded-[18px] border px-4 py-3 text-sm outline-none transition";

function normalizeStep(value: string | null | undefined): OnboardingStepKey {
  const matched = steps.find((step) => step.key === value);
  return matched?.key ?? "overview";
}

function buildFingerprint(draft: ProjectOnboardingDraft, step: OnboardingStepKey) {
  return JSON.stringify({
    draft: serializeProjectOnboardingDraft(draft),
    step,
  });
}

function readTextAreaList(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function ProjectOnboardingWizard(props: {
  session: ProjectOnboardingSession;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<ProjectOnboardingDraft>(() =>
    coerceProjectOnboardingDraft(props.session.intake),
  );
  const [activeStep, setActiveStep] = useState<OnboardingStepKey>(() =>
    normalizeStep(props.session.lastCompletedStep),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(
    props.session.projectId
      ? "This onboarding has already created a live workspace."
      : "Autosave keeps this brief recoverable while you work.",
  );
  const [lastSavedFingerprint, setLastSavedFingerprint] = useState(() =>
    buildFingerprint(
      coerceProjectOnboardingDraft(props.session.intake),
      normalizeStep(props.session.lastCompletedStep),
    ),
  );

  const activeStepIndex = steps.findIndex((step) => step.key === activeStep);
  const nextStep = steps[activeStepIndex + 1]?.key ?? null;
  const previousStep = steps[activeStepIndex - 1]?.key ?? null;
  const serializedDraft = serializeProjectOnboardingDraft(draft);

  async function persistDraft(
    step: OnboardingStepKey,
    options?: { silent?: boolean },
  ) {
    const fingerprint = buildFingerprint(draft, step);
    if (fingerprint === lastSavedFingerprint) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveProjectOnboardingForApp({
        sessionId: props.session.id,
        intake: serializedDraft,
        lastCompletedStep: step,
      });
      setLastSavedFingerprint(fingerprint);
      if (!options?.silent) {
        setStatusText(`Draft saved ${new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}.`);
      }
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "We could not save the onboarding draft right now.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    if (props.session.projectId) {
      return;
    }

    const fingerprint = buildFingerprint(draft, activeStep);
    if (fingerprint === lastSavedFingerprint) {
      return;
    }

    const timer = window.setTimeout(() => {
      void persistDraft(activeStep, { silent: true });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [activeStep, draft, lastSavedFingerprint, props.session.projectId]);

  function setDraftField<K extends keyof ProjectOnboardingDraft>(
    key: K,
    value: ProjectOnboardingDraft[K],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      await persistDraft("compliance");
      const result = await submitProjectOnboardingForApp(props.session.id);
      router.replace(result.projectRoute);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "We could not submit the onboarding brief right now.",
      );
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <ClientPortalKpiCard
          label="Package"
          value={props.session.package?.label || "Custom scope"}
          detail="The paid commercial package that opened this onboarding."
          tone="indigo"
        />
        <ClientPortalKpiCard
          label="Paid today"
          value={formatMoneyMinor(props.session.summary.payableTodayMinor)}
          detail="Collected before the brief so delivery can start without billing drag."
          tone="blue"
        />
        <ClientPortalKpiCard
          label="Add-ons"
          value={String(props.session.selectedAddons.length)}
          detail={
            props.session.selectedAddons.length
              ? props.session.selectedAddons.join(", ")
              : "No paid add-ons were attached to this order."
          }
          tone="cyan"
        />
        <ClientPortalKpiCard
          label="Status"
          value={props.session.projectId ? "Workspace ready" : isSaving ? "Saving" : "Drafting"}
          detail={statusText || "Finish the brief to create the project workspace."}
          tone="slate"
        />
      </section>

      {props.session.projectId ? (
        <ClientPortalSectionCard
          title="Workspace created"
          subtitle="The onboarding is already converted, so you can move straight into the live project workspace."
          action={<ClientPortalStatusPill label="Ready" tone="success" />}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.dashboard.project(props.session.projectId)}
              className="inline-flex items-center justify-center rounded-full bg-[var(--portal-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Open workspace
            </Link>
            <Link
              href={ROUTES.dashboard.projects}
              className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-semibold text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
            >
              Back to projects
            </Link>
            <p className="text-sm text-[var(--portal-muted)]">
              Submitted {formatPortalDate(props.session.submittedAt)}
            </p>
          </div>
        </ClientPortalSectionCard>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <ClientPortalSectionCard
          title="Step flow"
          subtitle="Finish the brief in one clean pass. Every step saves back to the server."
        >
          <div className="space-y-3">
            {steps.map((step, index) => {
              const active = step.key === activeStep;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setActiveStep(step.key)}
                  className="w-full rounded-[22px] border px-4 py-4 text-left transition"
                  style={{
                    borderColor: active
                      ? "var(--portal-accent-border)"
                      : "var(--portal-border)",
                    background: active
                      ? "var(--portal-elevated)"
                      : "var(--portal-card)",
                    boxShadow: active
                      ? "var(--portal-elevated-shadow)"
                      : "var(--portal-shadow)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--portal-muted)]">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[var(--portal-foreground)]">
                        {step.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--portal-muted)]">
                        {step.description}
                      </p>
                    </div>
                    {active ? (
                      <ClientPortalStatusPill label="Current" tone="indigo" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </ClientPortalSectionCard>

        <ClientPortalSectionCard
          title={steps[activeStepIndex]?.label || "Project brief"}
          subtitle={steps[activeStepIndex]?.description || "Complete the paid onboarding cleanly."}
          action={
            <div className="flex items-center gap-2">
              {isSaving ? (
                <ClientPortalStatusPill label="Saving" tone="neutral" />
              ) : (
                <ClientPortalStatusPill label="Autosave on" tone="success" />
              )}
            </div>
          }
        >
          <div className="space-y-5">
            {activeStep === "overview" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="font-medium text-[var(--portal-foreground)]">Project name</span>
                  <input
                    value={draft.projectName}
                    onChange={(event) => setDraftField("projectName", event.target.value)}
                    placeholder="Wagholi Highstreet April Launch"
                    className={fieldClassName}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium text-[var(--portal-foreground)]">Project type</span>
                  <select
                    value={draft.projectType}
                    onChange={(event) => setDraftField("projectType", event.target.value)}
                    className={fieldClassName}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  >
                    <option value="">Choose one</option>
                    <option value="builder-launch">Builder launch</option>
                    <option value="agency-campaign">Agency campaign</option>
                    <option value="business-service">Business/service</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Launch goal</span>
                  <textarea
                    value={draft.launchGoal}
                    onChange={(event) => setDraftField("launchGoal", event.target.value)}
                    placeholder="What should this page achieve?"
                    rows={4}
                    className={`${fieldClassName} resize-y`}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Target audience</span>
                  <textarea
                    value={draft.targetAudience}
                    onChange={(event) => setDraftField("targetAudience", event.target.value)}
                    placeholder="Who should convert on this page?"
                    rows={3}
                    className={`${fieldClassName} resize-y`}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
              </div>
            ) : null}

            {activeStep === "brand" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Drive or asset link</span>
                  <input
                    value={draft.driveLink}
                    onChange={(event) => setDraftField("driveLink", event.target.value)}
                    placeholder="Public Google Drive or asset folder link"
                    className={fieldClassName}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Reference URLs</span>
                  <textarea
                    value={draft.referenceUrls.join("\n")}
                    onChange={(event) =>
                      setDraftField("referenceUrls", readTextAreaList(event.target.value))
                    }
                    placeholder="One reference URL per line"
                    rows={4}
                    className={`${fieldClassName} resize-y`}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium text-[var(--portal-foreground)]">Brand tone</span>
                  <input
                    value={draft.brandTone}
                    onChange={(event) => setDraftField("brandTone", event.target.value)}
                    placeholder="Premium, direct, trustworthy..."
                    className={fieldClassName}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium text-[var(--portal-foreground)]">Primary CTA label</span>
                  <input
                    value={draft.primaryCta}
                    onChange={(event) => setDraftField("primaryCta", event.target.value)}
                    placeholder="Book site visit"
                    className={fieldClassName}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium text-[var(--portal-foreground)]">Primary color</span>
                  <input
                    value={draft.primaryColor}
                    onChange={(event) => setDraftField("primaryColor", event.target.value)}
                    placeholder="#0F172A"
                    className={fieldClassName}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium text-[var(--portal-foreground)]">Secondary color</span>
                  <input
                    value={draft.secondaryColor}
                    onChange={(event) => setDraftField("secondaryColor", event.target.value)}
                    placeholder="#E2E8F0"
                    className={fieldClassName}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
              </div>
            ) : null}

            {activeStep === "sections" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Hero heading</span>
                  <textarea
                    value={draft.heroHeading}
                    onChange={(event) => setDraftField("heroHeading", event.target.value)}
                    placeholder="The big headline clients should read first"
                    rows={3}
                    className={`${fieldClassName} resize-y`}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Hero subheading</span>
                  <textarea
                    value={draft.heroSubheading}
                    onChange={(event) => setDraftField("heroSubheading", event.target.value)}
                    placeholder="The supporting copy under the main headline"
                    rows={3}
                    className={`${fieldClassName} resize-y`}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Requested sections</span>
                  <textarea
                    value={draft.requestedSections.join("\n")}
                    onChange={(event) =>
                      setDraftField("requestedSections", readTextAreaList(event.target.value))
                    }
                    placeholder="One section per line: Hero, Amenities, Pricing, FAQs..."
                    rows={5}
                    className={`${fieldClassName} resize-y`}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Extra pages or scope notes</span>
                  <textarea
                    value={draft.extraPages}
                    onChange={(event) => setDraftField("extraPages", event.target.value)}
                    placeholder="Mention if this order needs thank-you pages, additional legal pages, or upsell pages."
                    rows={4}
                    className={`${fieldClassName} resize-y`}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
              </div>
            ) : null}

            {activeStep === "compliance" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-[18px] border px-4 py-3 text-sm text-[var(--portal-foreground)]"
                  style={{
                    borderColor: "var(--portal-border)",
                    background: "var(--portal-surface-soft)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={draft.legalPagesReady}
                    onChange={(event) => setDraftField("legalPagesReady", event.target.checked)}
                    className="h-4 w-4 accent-[#5347CE]"
                  />
                  Privacy, terms, refunds, and legal copy are ready or being supplied now.
                </label>
                <label className="text-sm">
                  <span className="font-medium text-[var(--portal-foreground)]">MahaRERA number</span>
                  <input
                    value={draft.mahareraNumber}
                    onChange={(event) => setDraftField("mahareraNumber", event.target.value)}
                    placeholder="If applicable"
                    className={fieldClassName}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Business address</span>
                  <textarea
                    value={draft.businessAddress}
                    onChange={(event) => setDraftField("businessAddress", event.target.value)}
                    placeholder="Registered address or address that should appear on the site"
                    rows={3}
                    className={`${fieldClassName} resize-y`}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Legal and support notes</span>
                  <textarea
                    value={draft.legalNotes}
                    onChange={(event) => setDraftField("legalNotes", event.target.value)}
                    placeholder="Anything legal, approvals-related, or compliance-sensitive"
                    rows={3}
                    className={`${fieldClassName} resize-y`}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  <span className="font-medium text-[var(--portal-foreground)]">Support notes for the team</span>
                  <textarea
                    value={draft.supportNotes}
                    onChange={(event) => setDraftField("supportNotes", event.target.value)}
                    placeholder="Delivery deadlines, approvals, internal contacts, or anything the team should know."
                    rows={4}
                    className={`${fieldClassName} resize-y`}
                    style={{
                      borderColor: "var(--portal-border)",
                      background: "var(--portal-surface-soft)",
                      color: "var(--portal-foreground)",
                    }}
                  />
                </label>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[18px] bg-[rgba(220,38,38,0.12)] px-4 py-3 text-sm text-[#FCA5A5]">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--portal-border)] pt-5">
              <div className="flex flex-wrap items-center gap-3">
                {previousStep ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep(previousStep)}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)]"
                  >
                    Back
                  </button>
                ) : null}
                {nextStep ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep(nextStep)}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--portal-accent-border)] bg-[var(--portal-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--portal-foreground)] transition hover:bg-[var(--portal-surface-soft)]"
                  >
                    Next step
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void persistDraft(activeStep);
                  }}
                  disabled={isSaving || isSubmitting || Boolean(props.session.projectId)}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--portal-foreground)] transition hover:border-[var(--portal-accent-border)] hover:bg-[var(--portal-surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save draft"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleSubmit();
                  }}
                  disabled={isSaving || isSubmitting || Boolean(props.session.projectId)}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--portal-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating workspace..." : "Submit and create project"}
                </button>
              </div>
            </div>
          </div>
        </ClientPortalSectionCard>
      </section>
    </div>
  );
}
