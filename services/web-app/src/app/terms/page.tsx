import type { Metadata } from "next";
import { PublicAppShell } from "@/components/public-app/public-app-shell";
import { publicTermsSections } from "@/lib/public-app-site";

export const metadata: Metadata = {
  title: "Terms and Conditions | Shasvata App",
  description:
    "Terms and conditions for the Shasvata client workspace, checkout, and productized service flows.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <PublicAppShell
      eyebrow="Terms and conditions"
      title="Commercial usage terms for the app-domain workspace and checkout flow."
      description="These terms explain how the public app surface, fixed-scope products, quote-first work, and client responsibilities are handled inside the Shasvata workspace."
    >
      <section className="rounded-[32px] border border-white/90 bg-white/86 p-6 shadow-[0_24px_58px_rgba(15,23,42,0.08)] md:p-8">
        <div className="space-y-7">
          {publicTermsSections.map((section, index) => (
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
