export type StorefrontPackageSlug =
  | "landing-page-starter"
  | "landing-page-growth"
  | "landing-page-premium";

export type StorefrontPackageProfile = {
  bestFor: string;
  scope: string;
  revisions: string;
  timeline: string;
  paymentTerms: string;
  recommendedLabel?: string;
  highlights: string[];
};

export type StorefrontComparisonRow = {
  label: string;
  values: Record<StorefrontPackageSlug, string>;
};

type StorefrontAddonLike = {
  slug: string;
};

export type StorefrontAddonGroup<T extends StorefrontAddonLike> = {
  label: string;
  description: string;
  items: T[];
};

export const recommendedStorefrontPackageSlug: StorefrontPackageSlug =
  "landing-page-growth";

export const storefrontPackageProfiles: Record<
  StorefrontPackageSlug,
  StorefrontPackageProfile
> = {
  "landing-page-starter": {
    bestFor: "Simple launches, local businesses, founders",
    scope: "One custom landing page, up to 6 structured sections",
    revisions: "1 revision round within the approved direction",
    timeline: "3-5 business days",
    paymentTerms: "60% advance / 40% before final handover or launch",
    highlights: [
      "One lead capture form, thank-you state, and standard CTA placement",
      "Privacy, terms, refunds, and contact/support pages included",
      "Built for lean launches that need clean deployment and clear scope",
    ],
  },
  "landing-page-growth": {
    bestFor: "Paid ads, service businesses, real-estate lead-gen",
    scope: "One custom landing page, up to 10 structured sections",
    revisions: "2 revision rounds within the approved direction",
    timeline: "5-7 business days",
    paymentTerms: "50% advance / 50% before final handover or launch",
    recommendedLabel: "Recommended for most lead-generation clients",
    highlights: [
      "Conversion-first section planning across hero, trust, offer, CTA flow, and objection handling",
      "Basic routing to one agreed destination plus tracking-ready script placement",
      "Launch QA across form checks, CTA checks, and responsive review",
    ],
  },
  "landing-page-premium": {
    bestFor: "Higher-ticket funnels, operator teams, paid-traffic systems",
    scope: "One premium landing page, up to 12 structured sections",
    revisions: "2 revision rounds within the approved direction",
    timeline: "7-12 business days",
    paymentTerms:
      "50% advance / 30% on design approval / 20% before final handover or launch",
    highlights: [
      "Message architecture, operational routing, and conversion action mapping",
      "One post-launch optimization pass and a 14-day support window",
      "Best when the landing page needs to operate like a tighter lead-capture system",
    ],
  },
};

export const storefrontComparisonRows: StorefrontComparisonRow[] = [
  {
    label: "Structured sections",
    values: {
      "landing-page-starter": "Up to 6",
      "landing-page-growth": "Up to 10",
      "landing-page-premium": "Up to 12",
    },
  },
  {
    label: "Routing",
    values: {
      "landing-page-starter": "One email address only",
      "landing-page-growth": "One agreed destination",
      "landing-page-premium": "One operational destination",
    },
  },
  {
    label: "Script handling",
    values: {
      "landing-page-starter": "Placement only if a clean embed is provided",
      "landing-page-growth": "Placement for provided scripts",
      "landing-page-premium": "Placement plus structured readiness",
    },
  },
  {
    label: "Revision rounds",
    values: {
      "landing-page-starter": "1 round",
      "landing-page-growth": "2 rounds",
      "landing-page-premium": "2 rounds",
    },
  },
  {
    label: "Post-launch support",
    values: {
      "landing-page-starter": "None",
      "landing-page-growth": "Launch confirmation only",
      "landing-page-premium": "14-day support + 1 optimization pass",
    },
  },
];

export const storefrontGuardrailLines = [
  "Included revisions apply only within the approved direction.",
  "Direction changes, added sections, new integrations, or new deliverables are billed separately.",
  "Clients are responsible for timely content, assets, approvals, access, and one clear point of contact.",
] as const;

const addonGroupDefinitions = [
  {
    label: "Scope and build",
    description: "Extra structure, compliance, and scoped build expansion.",
    slugs: [
      "landing-page-extra-section",
      "landing-page-compliance-pack",
      "landing-page-major-revision",
      "landing-page-extra-page",
    ],
  },
  {
    label: "Measurement and routing",
    description: "Copy, tracking, routing, and CRM handoff support.",
    slugs: [
      "landing-page-copywriting",
      "landing-page-tracking",
      "landing-page-email-updates",
      "landing-page-crm-integration",
    ],
  },
  {
    label: "Launch support",
    description: "Priority delivery and controlled post-launch help.",
    slugs: [
      "landing-page-priority-delivery",
      "landing-page-revision-bundle",
      "landing-page-monthly-support",
    ],
  },
];

export function groupStorefrontAddons<T extends StorefrontAddonLike>(addons: T[]) {
  const remaining = new Map(addons.map((item) => [item.slug, item]));

  const groups: StorefrontAddonGroup<T>[] = addonGroupDefinitions
    .map((definition) => {
      const items = definition.slugs
        .map((slug) => remaining.get(slug))
        .filter((item): item is T => Boolean(item));

      items.forEach((item) => remaining.delete(item.slug));

      return items.length
        ? {
            label: definition.label,
            description: definition.description,
            items,
          }
        : null;
    })
    .filter((group): group is StorefrontAddonGroup<T> => Boolean(group));

  if (remaining.size) {
    groups.push({
      label: "Additional add-ons",
      description: "Published extras that do not belong to the main storefront buckets yet.",
      items: Array.from(remaining.values()),
    });
  }

  return groups;
}
