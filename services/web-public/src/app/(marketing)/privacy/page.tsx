import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Shasvata Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <section className="pt-32 section-y">
      <div className="container-narrow">
        <div className="mb-12">
          <p className="eyebrow mb-4">Legal</p>
          <h1 className="text-fluid-2xl font-display font-black mb-4">Privacy Policy</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Last updated: March 2026
          </p>
        </div>

        <div className="prose-naya space-y-8 max-w-none">
          {[
            {
              title: "1. Who we are",
              body: "Shasvata Private Limited ('Shasvata', 'we', 'us') operates the website at shasvata.com. We are a growth infrastructure company based in India.",
            },
            {
              title: "2. What data we collect",
              body: "We collect only the information you choose to provide through our contact and enquiry forms: name, work email, phone number (optional), company name and type, website URL (optional), service interests, budget range, timeline, and a description of your current business challenge. We also collect standard technical data including browser type, IP address, page views, and UTM parameters from marketing links.",
            },
            {
              title: "3. How we use your data",
              body: "We use your information solely to: understand your enquiry and respond appropriately; determine whether there is a potential fit for Shasvata services; follow up with you via email or WhatsApp if you have consented; and improve our understanding of how businesses find and use our website. We do not sell, rent, or share your personal data with any third party for marketing purposes.",
            },
            {
              title: "4. Where your data is stored",
              body: "Enquiry data is stored in a private Notion database accessible only to Shasvata founders. Email notifications are sent via Resend. Website analytics are collected via Google Analytics 4. All data is stored on servers in secure environments.",
            },
            {
              title: "5. Data retention",
              body: "We retain enquiry data for as long as is necessary for business purposes. You may request deletion of your data at any time by emailing hello@shasvata.com.",
            },
            {
              title: "6. Cookies",
              body: "We use Google Analytics 4 cookies to understand website traffic and usage patterns. These cookies do not identify you personally. You may opt out of Google Analytics tracking by using the Google Analytics opt-out browser add-on.",
            },
            {
              title: "7. Your rights",
              body: "You have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data; withdraw consent for follow-up communications at any time. To exercise any of these rights, email hello@shasvata.com.",
            },
            {
              title: "8. WhatsApp and email follow-up",
              body: "If you provide your phone number and consent to follow-up, we may contact you via WhatsApp or email to discuss your enquiry. You may opt out at any time by replying 'stop' or emailing us.",
            },
            {
              title: "9. Changes to this policy",
              body: "We may update this Privacy Policy from time to time. We will update the 'last updated' date at the top of this page when we do so.",
            },
            {
              title: "10. Contact",
              body: "For any privacy-related questions or requests, contact us at: hello@shasvata.com — Shasvata Private Limited, India.",
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
