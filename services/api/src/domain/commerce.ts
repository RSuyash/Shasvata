export type CommerceItemKind = "PACKAGE" | "ADDON" | "QUOTE_ONLY";
export type CommerceCheckoutMode = "INSTANT" | "QUOTE_ONLY";
export type CommerceBillingModel = "FULL" | "ADVANCE";
export type CommerceFlowMode = "SELF_SERVE" | "QUOTE_REQUEST";
export type CommerceDiscountType = "PERCENTAGE" | "FIXED";

export type CommerceCatalogEntry = {
  slug: string;
  itemCode: string;
  label: string;
  summary: string;
  domain: "MARKETING" | "TECH" | "ADVISORY";
  categoryLabel: string;
  kind: CommerceItemKind;
  checkoutMode: CommerceCheckoutMode;
  billingModel: CommerceBillingModel;
  currency: string;
  basePriceMinor: number | null;
  defaultDepositPercent: number | null;
  addonParentSlug?: string;
  portalVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

export type CommerceOffer = {
  code: string;
  label: string;
  discountType: CommerceDiscountType;
  discountValue: number;
  appliesToKinds?: CommerceItemKind[];
  appliesToSlugs?: string[];
  minimumOrderMinor: number;
};

export type CommerceSelection = {
  slug: string;
  quantity: number;
};

export type CommerceDraftLine = {
  slug: string;
  itemCode: string;
  label: string;
  kind: CommerceItemKind;
  billingModel: CommerceBillingModel;
  checkoutMode: CommerceCheckoutMode;
  quantity: number;
  unitPriceMinor: number | null;
  lineSubtotalMinor: number;
  lineDiscountMinor: number;
  lineTotalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
};

export type CommerceDraft = {
  flowMode: CommerceFlowMode;
  requiresHumanReview: boolean;
  issues: string[];
  currency: string;
  lines: CommerceDraftLine[];
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
  appliedOffer: CommerceOffer | null;
};

function roundMinor(value: number): number {
  return Math.round(value);
}

function findOffer(
  offers: CommerceOffer[],
  couponCode: string | undefined,
  subtotalMinor: number,
  lines: CommerceDraftLine[],
): CommerceOffer | null {
  if (!couponCode) return null;

  const upperCode = couponCode.trim().toUpperCase();
  const matchingOffer = offers.find((offer) => offer.code.toUpperCase() === upperCode);
  if (!matchingOffer) return null;
  if (subtotalMinor < matchingOffer.minimumOrderMinor) return null;

  const eligibleLines = lines.filter((line) => {
    if (matchingOffer.appliesToKinds?.length && !matchingOffer.appliesToKinds.includes(line.kind)) {
      return false;
    }

    if (matchingOffer.appliesToSlugs?.length && !matchingOffer.appliesToSlugs.includes(line.slug)) {
      return false;
    }

    return line.lineSubtotalMinor > 0;
  });

  return eligibleLines.length > 0 ? matchingOffer : null;
}

function computeOfferDiscount(offer: CommerceOffer, eligibleSubtotalMinor: number): number {
  if (offer.discountType === "PERCENTAGE") {
    return roundMinor((eligibleSubtotalMinor * offer.discountValue) / 100);
  }

  return Math.min(offer.discountValue, eligibleSubtotalMinor);
}

export function calculateCommerceDraft(input: {
  catalog: CommerceCatalogEntry[];
  offers: CommerceOffer[];
  selections: CommerceSelection[];
  couponCode?: string;
}): CommerceDraft {
  if (input.selections.length === 0) {
    return {
      flowMode: "QUOTE_REQUEST",
      requiresHumanReview: true,
      issues: ["empty_selection"],
      currency: "INR",
      lines: [],
      subtotalMinor: 0,
      discountMinor: 0,
      totalMinor: 0,
      payableTodayMinor: 0,
      remainingAfterTodayMinor: 0,
      appliedOffer: null,
    };
  }

  const catalogMap = new Map(input.catalog.map((entry) => [entry.slug, entry]));
  const issues: string[] = [];
  const lines = input.selections.map<CommerceDraftLine>((selection) => {
    const entry = catalogMap.get(selection.slug);
    if (!entry) {
      throw new Error(`Unknown catalog item: ${selection.slug}`);
    }

    const quantity = Math.max(1, selection.quantity);
    const lineSubtotalMinor = (entry.basePriceMinor ?? 0) * quantity;

    if (entry.checkoutMode === "QUOTE_ONLY" || entry.basePriceMinor === null) {
      issues.push("quote_only_item_selected");
    }

    return {
      slug: entry.slug,
      itemCode: entry.itemCode,
      label: entry.label,
      kind: entry.kind,
      billingModel: entry.billingModel,
      checkoutMode: entry.checkoutMode,
      quantity,
      unitPriceMinor: entry.basePriceMinor,
      lineSubtotalMinor,
      lineDiscountMinor: 0,
      lineTotalMinor: lineSubtotalMinor,
      payableTodayMinor: 0,
      remainingAfterTodayMinor: 0,
    };
  });

  const currency = input.catalog[0]?.currency ?? "INR";
  const subtotalMinor = lines.reduce((sum, line) => sum + line.lineSubtotalMinor, 0);
  const appliedOffer = findOffer(input.offers, input.couponCode, subtotalMinor, lines);

  if (appliedOffer) {
    const eligibleLines = lines.filter((line) => {
      if (appliedOffer.appliesToKinds?.length && !appliedOffer.appliesToKinds.includes(line.kind)) {
        return false;
      }

      if (appliedOffer.appliesToSlugs?.length && !appliedOffer.appliesToSlugs.includes(line.slug)) {
        return false;
      }

      return line.lineSubtotalMinor > 0;
    });

    const eligibleSubtotalMinor = eligibleLines.reduce((sum, line) => sum + line.lineSubtotalMinor, 0);
    let remainingDiscountMinor = computeOfferDiscount(appliedOffer, eligibleSubtotalMinor);

    eligibleLines.forEach((line, index) => {
      if (remainingDiscountMinor <= 0) return;

      const isLast = index === eligibleLines.length - 1;
      const share = isLast
        ? remainingDiscountMinor
        : roundMinor((line.lineSubtotalMinor / eligibleSubtotalMinor) * computeOfferDiscount(appliedOffer, eligibleSubtotalMinor));
      const boundedShare = Math.min(share, line.lineSubtotalMinor, remainingDiscountMinor);

      line.lineDiscountMinor = boundedShare;
      line.lineTotalMinor = line.lineSubtotalMinor - boundedShare;
      remainingDiscountMinor -= boundedShare;
    });
  }

  const flowMode: CommerceFlowMode = issues.length > 0 ? "QUOTE_REQUEST" : "SELF_SERVE";
  const totalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);
  const discountMinor = lines.reduce((sum, line) => sum + line.lineDiscountMinor, 0);

  if (flowMode === "SELF_SERVE") {
    lines.forEach((line) => {
      if (line.billingModel === "ADVANCE") {
        const entry = catalogMap.get(line.slug);
        const depositPercent = entry?.defaultDepositPercent ?? 100;
        line.payableTodayMinor = roundMinor((line.lineTotalMinor * depositPercent) / 100);
        line.remainingAfterTodayMinor = line.lineTotalMinor - line.payableTodayMinor;
        return;
      }

      line.payableTodayMinor = line.lineTotalMinor;
      line.remainingAfterTodayMinor = 0;
    });
  }

  return {
    flowMode,
    requiresHumanReview: flowMode === "QUOTE_REQUEST",
    issues,
    currency,
    lines,
    subtotalMinor,
    discountMinor,
    totalMinor,
    payableTodayMinor: lines.reduce((sum, line) => sum + line.payableTodayMinor, 0),
    remainingAfterTodayMinor: lines.reduce((sum, line) => sum + line.remainingAfterTodayMinor, 0),
    appliedOffer,
  };
}
