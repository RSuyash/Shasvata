import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Shasvata Terms of Service.",
};

export default function TermsPage() {
  return (
    <section className="pt-32 section-y">
      <div className="container-narrow">
        <div className="mb-12">
          <p className="eyebrow mb-4">Legal</p>
          <h1 className="text-fluid-2xl font-display font-black mb-4">Terms of Service</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Last updated: March 2026</p>
        </div>

        <div className="prose-naya space-y-8 max-w-none">
          {[
            {
              title: "1. Nature of this website",
              body: "This website is an informational and service inquiry platform operated by Shasvata Private Limited. Submitting an enquiry form does not constitute a binding agreement or guarantee of service engagement.",
            },
            {
              title: "2. Service engagements",
              body: "Any service engagement between Shasvata and a client is subject to a separate, mutually agreed commercial agreement. All project scopes, timelines, deliverables, and commercial terms are defined in those agreements.",
            },
            {
              title: "3. No guarantees",
              body: "Shasvata makes no guarantee of specific business outcomes, revenue growth, or performance improvements. All case descriptions and engagement summaries are illustrative and do not constitute performance guarantees.",
            },
            {
              title: "4. Intellectual property",
              body: "All content on this website — including text, graphics, layouts, code, and design — is the property of Shasvata Private Limited. You may not reproduce, distribute, or use any content without prior written permission.",
            },
            {
              title: "5. Limitation of liability",
              body: "To the fullest extent permitted by law, Shasvata shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of this website or reliance on any information presented here.",
            },
            {
              title: "6. Links to third-party sites",
              body: "This website may contain links to third-party websites. Shasvata is not responsible for the content, privacy practices, or accuracy of any third-party websites.",
            },
            {
              title: "7. Governing law",
              body: "These terms are governed by the laws of India. Any disputes arising from these terms or your use of this website shall be subject to the jurisdiction of courts in Pune, Maharashtra, India.",
            },
            {
              title: "8. Contact",
              body: "For questions about these terms, contact us at hello@shasvata.com.",
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-[hsl(var(--foreground))] mb-3">{title}</h2>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
