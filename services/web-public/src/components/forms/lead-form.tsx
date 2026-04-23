"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  serviceInterestOptions,
  budgetOptions,
  timelineOptions,
} from "@/content/site";

// ─── Schema ────────────────────────────────────────────────
const leadSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid work email"),
  phone: z.string().optional(),
  companyName: z.string().min(1, "Please enter your company name"),
  companyType: z.enum(["startup", "sme", "brand", "enterprise", "freelancer", "other"]),
  websiteUrl: z.string().optional(),
  serviceInterest: z.array(z.string()).min(1, "Please select at least one area"),
  budgetRange: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  problemSummary: z.string().min(10, "Please describe your current bottleneck (10+ characters)"),
  consent: z.literal(true, { errorMap: () => ({ message: "You must agree to continue" }) }),
});

type LeadFormValues = z.infer<typeof leadSchema>;

const STEPS = [
  { title: "What you need", fields: ["serviceInterest"] },
  { title: "Your business", fields: ["companyName", "companyType", "websiteUrl"] },
  { title: "Timeline & budget", fields: ["budgetRange", "timeline", "problemSummary"] },
  { title: "Your details", fields: ["fullName", "email", "phone", "consent"] },
] as const;

export function LeadForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { serviceInterest: [] },
  });

  const serviceInterest = watch("serviceInterest");

  const toggleServiceInterest = (value: string) => {
    const current = serviceInterest ?? [];
    setValue(
      "serviceInterest",
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      { shouldValidate: true },
    );
  };

  const onSubmit = async (data: LeadFormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) throw new Error("Submission failed. Please try again.");
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="rounded-3xl border border-[rgb(var(--naya-sky)/0.3)] bg-[rgb(var(--naya-sky)/0.06)] p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--naya-sky)/0.15)]">
          <CheckCircle className="h-8 w-8 text-[rgb(var(--naya-sky))]" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-[hsl(var(--foreground))]">
          Thanks — we've received your enquiry.
        </h3>
        <p className="text-[hsl(var(--muted-foreground))] leading-relaxed max-w-sm mx-auto">
          We'll review the details and get back to you with the most useful next step — not a
          generic auto-response. We typically respond within one business day.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {STEPS[step]?.title}
          </span>
        </div>
        <div className="h-1 rounded-full bg-[hsl(var(--muted))]">
          <div
            className="h-full rounded-full bg-[rgb(var(--naya-sky))] transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ── Step 0: Service interest ─────────────────────── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[hsl(var(--foreground))]">
                What do you need help with?{" "}
                <span className="text-[rgb(var(--naya-sky))]">*</span>
              </label>
              <p className="mb-4 text-xs text-[hsl(var(--muted-foreground))]">
                Select all that apply
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {serviceInterestOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleServiceInterest(opt.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                      serviceInterest?.includes(opt.value)
                        ? "border-[rgb(var(--naya-sky))] bg-[rgb(var(--naya-sky)/0.1)] text-[hsl(var(--foreground))]"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[rgb(var(--naya-sky)/0.4)] hover:text-[hsl(var(--foreground))]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        serviceInterest?.includes(opt.value)
                          ? "border-[rgb(var(--naya-sky))] bg-[rgb(var(--naya-sky))]"
                          : "border-[hsl(var(--border))]",
                      )}
                    >
                      {serviceInterest?.includes(opt.value) && (
                        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.serviceInterest && (
                <p className="mt-2 text-xs text-[rgb(var(--naya-error))]">
                  {errors.serviceInterest.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 1: Business ───────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="mb-1.5 block text-sm font-semibold text-[hsl(var(--foreground))]">
                Company / Brand name <span className="text-[rgb(var(--naya-sky))]">*</span>
              </label>
              <input
                id="companyName"
                {...register("companyName")}
                className="input-base"
                placeholder="Acme Inc."
              />
              {errors.companyName && (
                <p className="mt-1 text-xs text-[rgb(var(--naya-error))]">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="companyType" className="mb-1.5 block text-sm font-semibold text-[hsl(var(--foreground))]">
                Company type <span className="text-[rgb(var(--naya-sky))]">*</span>
              </label>
              <select id="companyType" {...register("companyType")} className="input-base">
                <option value="">Select...</option>
                <option value="startup">Startup</option>
                <option value="sme">SME / Growing business</option>
                <option value="brand">Brand / Consumer company</option>
                <option value="enterprise">Enterprise</option>
                <option value="freelancer">Freelancer / Solopreneur</option>
                <option value="other">Other</option>
              </select>
              {errors.companyType && (
                <p className="mt-1 text-xs text-[rgb(var(--naya-error))]">{errors.companyType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="websiteUrl" className="mb-1.5 block text-sm font-semibold text-[hsl(var(--foreground))]">
                Website or social link{" "}
                <span className="text-[hsl(var(--muted-foreground))] font-normal">(optional)</span>
              </label>
              <input
                id="websiteUrl"
                {...register("websiteUrl")}
                className="input-base"
                placeholder="https://yourcompany.com"
                type="url"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Timeline & problem ─────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="budgetRange" className="mb-1.5 block text-sm font-semibold text-[hsl(var(--foreground))]">
                Budget range <span className="text-[rgb(var(--naya-sky))]">*</span>
              </label>
              <select id="budgetRange" {...register("budgetRange")} className="input-base">
                <option value="">Select...</option>
                {budgetOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.budgetRange && (
                <p className="mt-1 text-xs text-[rgb(var(--naya-error))]">{errors.budgetRange.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="timeline" className="mb-1.5 block text-sm font-semibold text-[hsl(var(--foreground))]">
                How soon are you looking to move? <span className="text-[rgb(var(--naya-sky))]">*</span>
              </label>
              <select id="timeline" {...register("timeline")} className="input-base">
                <option value="">Select...</option>
                {timelineOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.timeline && (
                <p className="mt-1 text-xs text-[rgb(var(--naya-error))]">{errors.timeline.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="problemSummary" className="mb-1.5 block text-sm font-semibold text-[hsl(var(--foreground))]">
                What is the current bottleneck? <span className="text-[rgb(var(--naya-sky))]">*</span>
              </label>
              <p className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">
                The more context you give us, the better the diagnosis.
              </p>
              <textarea
                id="problemSummary"
                {...register("problemSummary")}
                className="input-base min-h-[120px] resize-y"
                placeholder="e.g. Our marketing is running but we have no visibility into what's working. Leads come in but follow-up is manual and inconsistent..."
              />
              {errors.problemSummary && (
                <p className="mt-1 text-xs text-[rgb(var(--naya-error))]">{errors.problemSummary.message}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Contact details ───────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-[hsl(var(--foreground))]">
                Full name <span className="text-[rgb(var(--naya-sky))]">*</span>
              </label>
              <input
                id="fullName"
                {...register("fullName")}
                className="input-base"
                placeholder="Suyash Kumar"
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-[rgb(var(--naya-error))]">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[hsl(var(--foreground))]">
                Work email <span className="text-[rgb(var(--naya-sky))]">*</span>
              </label>
              <input
                id="email"
                {...register("email")}
                className="input-base"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[rgb(var(--naya-error))]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-[hsl(var(--foreground))]">
                Phone / WhatsApp{" "}
                <span className="text-[hsl(var(--muted-foreground))] font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                {...register("phone")}
                className="input-base"
                type="tel"
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] p-4">
              <input
                id="consent"
                type="checkbox"
                {...register("consent")}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--naya-sky))] cursor-pointer"
              />
              <label htmlFor="consent" className="text-xs text-[hsl(var(--muted-foreground))] cursor-pointer leading-relaxed">
                I agree to Shasvata's{" "}
                <a href="/privacy" className="text-[rgb(var(--naya-sky))] hover:underline" target="_blank">
                  Privacy Policy
                </a>{" "}
                and consent to being contacted about my enquiry. We use this information only to
                understand your enquiry and respond appropriately.
              </label>
            </div>
            {errors.consent && (
              <p className="text-xs text-[rgb(var(--naya-error))]">{errors.consent.message}</p>
            )}
          </div>
        )}

        {/* Server error */}
        {serverError && (
          <div className="mt-4 rounded-xl border border-[rgb(var(--naya-error)/0.3)] bg-[rgb(var(--naya-error)/0.07)] px-4 py-3 text-sm text-[rgb(var(--naya-error))]">
            {serverError}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn-secondary gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn-primary gap-2"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary gap-2 min-w-[160px]"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                "Send Enquiry"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
