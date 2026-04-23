import type { Metadata } from "next";
import { PublicAppShell } from "@/components/public-app/public-app-shell";
import { publicRefundSections } from "@/lib/public-app-site";

export const metadata: Metadata = {
  title: "Refunds and Cancellations | Shasvata App",
  description:
    "Refund and cancellation policy for Shasvata productized packages, quote-first work, and workspace payments.",
  robots: { index: true, follow: true },
};

export default function RefundsAndCancellationsPage() {
  return (
    <PublicAppShell
      eyebrow="Refunds and cancellations"
      title="Refund handling for package checkout, quote-first scope, and active production work."
      description="This policy keeps payment-provider review and client expectations clear before checkout. Fixed-scope package purchases, quote-led work, and payment corrections are handled through the rules below."
    >
      <section className="rounded-[32px] border border-white/90 bg-white/86 p-6 shadow-[0_24px_58px_rgba(15,23,42,0.08)] md:p-8">
        <div className="space-y-7">
          {publicRefundSections.map((section, index) => (
            <div
              key={section.title}
              className={index === 0 ? "" : "border-t border-slate-200 pt-7"}
            >
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicAppShell>
  );
}
