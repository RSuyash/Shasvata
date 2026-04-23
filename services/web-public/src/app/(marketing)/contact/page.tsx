import type { Metadata } from "next";
import { MessageCircle, Mail, ArrowRight } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Shasvata to discuss growth systems, workflow automation, infrastructure design, and practical AI support.",
};

const message = encodeURIComponent(
  "Hi, I'm reaching out regarding growth / systems / automation support for my business.",
);

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid" aria-hidden="true" />
        <div className="glow-orb -z-10 absolute right-0 top-0 h-[350px] w-[350px] bg-[rgb(var(--naya-sky)/0.07)]" />
        <div className="container-naya">
          <p className="eyebrow mb-5">Start a Conversation</p>
          <h1 className="text-fluid-2xl font-display font-black mb-5 max-w-2xl text-balance">
            Let's understand what you{" "}
            <span className="gradient-text-dark dark:gradient-text">actually need.</span>
          </h1>
          <p className="max-w-xl text-lg text-slate-700 leading-relaxed">
            Tell us where the bottleneck is — growth, workflow, systems, automation, visibility,
            or AI adoption — and we'll help map the right next step.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="section-y bg-[hsl(var(--background))]">
        <div className="container-naya">
          <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-16">

            {/* Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
                  Start the conversation
                </h2>
                <p className="text-sm text-slate-700">
                  The more context you give us, the better the diagnosis.
                </p>
              </div>
              <LeadForm />
            </div>

            {/* Sidebar */}
            <div className="space-y-5 lg:pt-2">
              {/* Direct contact */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                <h3 className="font-bold text-[hsl(var(--foreground))] mb-4">
                  Prefer to talk directly?
                </h3>
                <p className="text-sm text-slate-700 mb-5 leading-relaxed">
                  If you already know you want to discuss a project, reach us directly. We respond
                  to all serious enquiries within one business day.
                </p>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, "")}?text=${message}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:border-[#25D366] hover:bg-[#25D366/0.05] transition-all group"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366/0.1] text-[#25D366]">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    Chat on WhatsApp
                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:border-[rgb(var(--naya-sky)/0.4)] transition-all group"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--naya-sky)/0.1)] text-[rgb(var(--naya-sky))]">
                      <Mail className="h-4 w-4" />
                    </span>
                    {siteConfig.email}
                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>

              {/* What to expect */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                <h3 className="font-bold text-[hsl(var(--foreground))] mb-4">
                  What to expect
                </h3>
                <div className="space-y-4">
                  {[
                    { step: "01", text: "We review your enquiry carefully — not a templated response." },
                    { step: "02", text: "We respond within one business day with a useful next step." },
                    { step: "03", text: "If there's a fit, we schedule a focused discovery conversation." },
                    { step: "04", text: "We help you understand the right scope before any commitment." },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex gap-3">
                      <span className="step-dot h-7 w-7 shrink-0 text-xs">{step}</span>
                      <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* No pressure note */}
              <div className="rounded-2xl bg-[rgb(var(--naya-sky)/0.05)] border border-[rgb(var(--naya-sky)/0.15)] p-5">
                <p className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-[hsl(var(--foreground))]">No pressure.</span>{" "}
                  Filling out this form starts a conversation, not a sales process. Some businesses
                  come with a clear scope. Others come with a messy symptom. Both are fine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
