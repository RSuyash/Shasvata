import type { Metadata } from "next";
import { PublicAppShell } from "@/components/public-app/public-app-shell";
import { publicAppIdentity, publicContactCards } from "@/lib/public-app-site";

export const metadata: Metadata = {
  title: "Contact | Shasvata App",
  description:
    "Contact Shasvata for billing support, workspace access, product questions, and commercial clarifications.",
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <PublicAppShell
      eyebrow="Contact us"
      title="Get billing, support, or product questions answered without leaving the app domain."
      description="This page is kept public for support, payment-provider review, and client reassurance. If your question is about checkout, billing, or an active project, include the order or workspace context in your message."
    >
      <section className="grid gap-5 lg:grid-cols-3">
        {publicContactCards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="rounded-[30px] border border-white/90 bg-white/84 p-6 shadow-[0_24px_58px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
          >
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
              {card.title}
            </p>
            <p className="mt-5 font-display text-3xl font-black tracking-[-0.05em] text-slate-950">
              {card.value}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{card.detail}</p>
          </a>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[30px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(247,250,255,0.94)_100%)] p-6 shadow-[0_24px_58px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
            Business details
          </p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              <span className="font-semibold text-slate-950">Business:</span> Shasvata
            </p>
            <p>
              <span className="font-semibold text-slate-950">Location:</span> {publicAppIdentity.location}
            </p>
            <p>
              <span className="font-semibold text-slate-950">Workspace URL:</span> https://shasvata.com/app
            </p>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/90 bg-white/84 p-6 shadow-[0_24px_58px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
            What to include
          </p>
          <div className="mt-5 grid gap-3">
            {[
              "Order, billing, or checkout reference if the question is payment-related.",
              "Workspace email and project name if the question is about an active delivery.",
              "Desired package or add-ons if you are still choosing scope.",
              "Any payment, approval, or support deadline that matters for the request.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-slate-200 bg-slate-50/90 px-4 py-4 text-sm leading-6 text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicAppShell>
  );
}
