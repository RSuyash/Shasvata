import type { Metadata } from "next";
import { PublicAppShell } from "@/components/public-app/public-app-shell";
import { publicPrivacySections } from "@/lib/public-app-site";

export const metadata: Metadata = {
  title: "Privacy Policy | Shasvata App",
  description:
    "Privacy policy for the Shasvata app domain, including workspace, checkout, and delivery data handling.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <PublicAppShell
      eyebrow="Privacy policy"
      title="How checkout, workspace, and onboarding data is handled inside the Shasvata app."
      description="The app-domain policy focuses on what is needed to sell, bill, deliver, and support productized Shasvata services while keeping client and commercial data controlled."
    >
      <section className="rounded-[32px] border border-white/90 bg-white/86 p-6 shadow-[0_24px_58px_rgba(15,23,42,0.08)] md:p-8">
        <div className="space-y-7">
          {publicPrivacySections.map((section, index) => (
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
