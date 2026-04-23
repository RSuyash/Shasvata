import {
  type CommerceBillingModel,
  type CommerceCatalogEntry,
  type CommerceCheckoutMode,
  type CommerceItemKind,
  type CommerceOffer,
  type CommerceSelection,
} from "../domain/commerce.js";
import { commerceOfferSeeds } from "../data/commerce-catalog.js";

export type BillingOfferPolicyInput = {
  id: string;
  code: string;
  label: string;
  scopeType: "GLOBAL" | "PROJECT" | "SKU" | "CLIENT_SEGMENT" | "CHECKOUT";
  scopeProjectId?: string | null;
  discountType: "PERCENT" | "FIXED_MINOR" | "DEPOSIT_OVERRIDE" | "PAY_NOW_INCENTIVE" | "BUNDLE";
  discountValue: number;
  couponCode?: string | null;
  referralCode?: string | null;
  stackingMode: "EXCLUSIVE" | "STACKABLE" | "BEST_OF";
  minSubtotalMinor?: number | null;
  maxDiscountMinor?: number | null;
  validFrom?: Date | null;
  validUntil?: Date | null;
  usageLimit?: number | null;
  requiresOperatorApproval: boolean;
  marketingLabel?: string | null;
  internalReason?: string | null;
  isActive: boolean;
};

export type BillingPreviewConfig = {
  currency: string;
  allowCoupons: boolean;
  allowReferral: boolean;
  allowOperatorOverride: boolean;
  defaultDepositPercent: number | null;
  defaultPaymentMode: "DEPOSIT" | "FULL";
};

export type BillingCustomLineInput = {
  slug?: string | null;
  itemCode: string;
  label: string;
  quantity: number;
  unitPriceMinor: number;
  kind?: CommerceItemKind;
  billingModel?: CommerceBillingModel;
  checkoutMode?: CommerceCheckoutMode;
  defaultDepositPercent?: number | null;
};

export type BillingPreviewLine = {
  slug: string;
  itemCode: string;
  label: string;
  quantity: number;
  kind: CommerceItemKind;
  billingModel: CommerceBillingModel;
  checkoutMode: CommerceCheckoutMode;
  unitPriceMinor: number;
  lineSubtotalMinor: number;
  lineDiscountMinor: number;
  lineTotalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
};

export type BillingPreviewResult = {
  currency: string;
  paymentMode: "DEPOSIT" | "FULL";
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  payableTodayMinor: number;
  remainingAfterTodayMinor: number;
  lines: BillingPreviewLine[];
  appliedOfferCodes: string[];
  issues: string[];
};

type InternalLine = BillingPreviewLine & {
  defaultDepositPercent: number | null;
};

type InternalDiscountPolicy = {
  code: string;
  label: string;
  stackingMode: "EXCLUSIVE" | "STACKABLE" | "BEST_OF";
  kind: "MONETARY" | "DEPOSIT_OVERRIDE";
  discountType: BillingOfferPolicyInput["discountType"] | "STATIC";
  discountValue: number;
  maxDiscountMinor: number | null;
  appliesToKinds?: CommerceItemKind[];
  appliesToSlugs?: string[];
};

function roundMinor(value: number): number {
  return Math.round(value);
}

function buildCatalogLines(input: {
  catalog: CommerceCatalogEntry[];
  selections?: CommerceSelection[];
}): InternalLine[] {
  const catalogMap = new Map(input.catalog.map((entry) => [entry.slug, entry]));

  return (input.selections ?? []).map((selection) => {
    const entry = catalogMap.get(selection.slug);
    if (!entry) {
      throw new Error(`Unknown catalog item: ${selection.slug}`);
    }

    const quantity = Math.max(1, selection.quantity);
    const lineSubtotalMinor = (entry.basePriceMinor ?? 0) * quantity;

    return {
      slug: entry.slug,
      itemCode: entry.itemCode,
      label: entry.label,
      quantity,
      kind: entry.kind,
      billingModel: entry.billingModel,
      checkoutMode: entry.checkoutMode,
      unitPriceMinor: entry.basePriceMinor ?? 0,
      lineSubtotalMinor,
      lineDiscountMinor: 0,
      lineTotalMinor: lineSubtotalMinor,
      payableTodayMinor: 0,
      remainingAfterTodayMinor: 0,
      defaultDepositPercent: entry.defaultDepositPercent ?? null,
    };
  });
}

function buildCustomLines(input: {
  customLines?: BillingCustomLineInput[];
}): InternalLine[] {
  return (input.customLines ?? []).map((line, index) => {
    const quantity = Math.max(1, line.quantity);
    const lineSubtotalMinor = line.unitPriceMinor * quantity;

    return {
      slug: line.slug?.trim() || `custom-line-${index + 1}`,
      itemCode: line.itemCode,
      label: line.label,
      quantity,
      kind: line.kind ?? "PACKAGE",
      billingModel: line.billingModel ?? "FULL",
      checkoutMode: line.checkoutMode ?? "INSTANT",
      unitPriceMinor: line.unitPriceMinor,
      lineSubtotalMinor,
      lineDiscountMinor: 0,
      lineTotalMinor: lineSubtotalMinor,
      payableTodayMinor: 0,
      remainingAfterTodayMinor: 0,
      defaultDepositPercent: line.defaultDepositPercent ?? null,
    };
  });
}

function isPolicyActive(policy: BillingOfferPolicyInput, now: Date, projectId?: string): boolean {
  if (!policy.isActive) {
    return false;
  }

  if (policy.scopeType === "PROJECT" && policy.scopeProjectId && policy.scopeProjectId !== projectId) {
    return false;
  }

  if (policy.validFrom && policy.validFrom.getTime() > now.getTime()) {
    return false;
  }

  if (policy.validUntil && policy.validUntil.getTime() < now.getTime()) {
    return false;
  }

  return true;
}

function estimatePolicyDiscount(
  policy: InternalDiscountPolicy,
  subtotalMinor: number,
  paymentMode: "DEPOSIT" | "FULL",
): number {
  if (policy.kind === "DEPOSIT_OVERRIDE") {
    return 0;
  }

  let estimated = 0;
  switch (policy.discountType) {
    case "STATIC":
    case "PERCENT":
      estimated = roundMinor((subtotalMinor * policy.discountValue) / 100);
      break;
    case "FIXED_MINOR":
    case "BUNDLE":
      estimated = policy.discountValue;
      break;
    case "PAY_NOW_INCENTIVE":
      if (paymentMode !== "FULL") {
        estimated = 0;
      } else if (policy.discountValue <= 100) {
        estimated = roundMinor((subtotalMinor * policy.discountValue) / 100);
      } else {
        estimated = policy.discountValue;
      }
      break;
    default:
      estimated = 0;
  }

  if (policy.maxDiscountMinor !== null) {
    return Math.min(estimated, policy.maxDiscountMinor);
  }

  return estimated;
}

function mapPolicyOffer(policy: BillingOfferPolicyInput): InternalDiscountPolicy {
  return {
    code: policy.code,
    label: policy.label,
    stackingMode: policy.stackingMode,
    kind: policy.discountType === "DEPOSIT_OVERRIDE" ? "DEPOSIT_OVERRIDE" : "MONETARY",
    discountType: policy.discountType,
    discountValue: policy.discountValue,
    maxDiscountMinor: policy.maxDiscountMinor ?? null,
  };
}

function mapStaticOffer(offer: CommerceOffer): InternalDiscountPolicy {
  return {
    code: offer.code,
    label: offer.label,
    stackingMode: "EXCLUSIVE",
    kind: "MONETARY",
    discountType: "STATIC",
    discountValue: offer.discountValue,
    maxDiscountMinor: null,
    appliesToKinds: offer.appliesToKinds,
    appliesToSlugs: offer.appliesToSlugs,
  };
}

function buildEligibleOfferPolicies(input: {
  config: BillingPreviewConfig;
  policies?: BillingOfferPolicyInput[];
  couponCode?: string;
  referralCode?: string;
  paymentMode: "DEPOSIT" | "FULL";
  subtotalMinor: number;
  projectId?: string;
  now: Date;
}): InternalDiscountPolicy[] {
  const results: InternalDiscountPolicy[] = [];
  const couponCode = input.couponCode?.trim().toUpperCase();
  const referralCode = input.referralCode?.trim().toUpperCase();

  if (couponCode && input.config.allowCoupons) {
    const staticOffer = commerceOfferSeeds.find(
      (offer) => offer.code.trim().toUpperCase() === couponCode,
    );
    if (staticOffer && input.subtotalMinor >= staticOffer.minimumOrderMinor) {
      results.push(mapStaticOffer(staticOffer));
    }
  }

  if (referralCode && input.config.allowReferral) {
    const staticOffer = commerceOfferSeeds.find(
      (offer) => offer.code.trim().toUpperCase() === referralCode,
    );
    if (staticOffer && input.subtotalMinor >= staticOffer.minimumOrderMinor) {
      results.push(mapStaticOffer(staticOffer));
    }
  }

  for (const policy of input.policies ?? []) {
    if (!isPolicyActive(policy, input.now, input.projectId)) {
      continue;
    }

    const minSubtotalMinor = policy.minSubtotalMinor ?? 0;
    if (input.subtotalMinor < minSubtotalMinor) {
      continue;
    }

    const matchesCoupon =
      couponCode &&
      (policy.couponCode?.trim().toUpperCase() === couponCode ||
        policy.code.trim().toUpperCase() === couponCode);
    const matchesReferral =
      referralCode &&
      (policy.referralCode?.trim().toUpperCase() === referralCode ||
        policy.code.trim().toUpperCase() === referralCode);
    const isAlwaysOn =
      !policy.couponCode?.trim() &&
      !policy.referralCode?.trim() &&
      (policy.scopeType === "GLOBAL" || policy.scopeType === "PROJECT");

    if (
      (matchesCoupon && input.config.allowCoupons) ||
      (matchesReferral && input.config.allowReferral) ||
      isAlwaysOn
    ) {
      results.push(mapPolicyOffer(policy));
    }
  }

  const exclusivePolicies = results.filter((policy) => policy.stackingMode === "EXCLUSIVE");
  const bestOfPolicies = results.filter((policy) => policy.stackingMode === "BEST_OF");
  const stackablePolicies = results.filter((policy) => policy.stackingMode === "STACKABLE");
  const resolved: InternalDiscountPolicy[] = [...stackablePolicies];

  const highestExclusive = [...exclusivePolicies, ...bestOfPolicies]
    .sort(
      (left, right) =>
        estimatePolicyDiscount(right, input.subtotalMinor, input.paymentMode) -
        estimatePolicyDiscount(left, input.subtotalMinor, input.paymentMode),
    )[0];

  if (highestExclusive) {
    resolved.unshift(highestExclusive);
  }

  return resolved;
}

function applyDiscountToLines(input: {
  lines: InternalLine[];
  policy: InternalDiscountPolicy;
  paymentMode: "DEPOSIT" | "FULL";
}): number {
  if (input.policy.kind !== "MONETARY") {
    return 0;
  }

  const eligibleLines = input.lines.filter((line) => {
    if (line.lineTotalMinor <= 0) {
      return false;
    }

    if (
      input.policy.appliesToKinds?.length &&
      !input.policy.appliesToKinds.includes(line.kind)
    ) {
      return false;
    }

    if (
      input.policy.appliesToSlugs?.length &&
      !input.policy.appliesToSlugs.includes(line.slug)
    ) {
      return false;
    }

    return true;
  });

  if (eligibleLines.length === 0) {
    return 0;
  }

  const eligibleSubtotalMinor = eligibleLines.reduce(
    (sum, line) => sum + line.lineTotalMinor,
    0,
  );
  let totalDiscountMinor = estimatePolicyDiscount(
    input.policy,
    eligibleSubtotalMinor,
    input.paymentMode,
  );

  if (totalDiscountMinor <= 0) {
    return 0;
  }

  totalDiscountMinor = Math.min(totalDiscountMinor, eligibleSubtotalMinor);
  let remainingDiscountMinor = totalDiscountMinor;

  eligibleLines.forEach((line, index) => {
    const isLastLine = index === eligibleLines.length - 1;
    const proposedShare = isLastLine
      ? remainingDiscountMinor
      : roundMinor((line.lineTotalMinor / eligibleSubtotalMinor) * totalDiscountMinor);
    const boundedShare = Math.min(line.lineTotalMinor, proposedShare, remainingDiscountMinor);

    line.lineDiscountMinor += boundedShare;
    line.lineTotalMinor -= boundedShare;
    remainingDiscountMinor -= boundedShare;
  });

  return totalDiscountMinor;
}

function resolveDepositOverride(input: {
  policies: InternalDiscountPolicy[];
  defaultDepositPercent: number | null;
}): number | null {
  const override = input.policies.find((policy) => policy.kind === "DEPOSIT_OVERRIDE");
  if (!override) {
    return input.defaultDepositPercent;
  }

  return Math.max(0, Math.min(100, override.discountValue));
}

export function evaluateBillingPreview(input: {
  config: BillingPreviewConfig;
  catalog: CommerceCatalogEntry[];
  selections?: CommerceSelection[];
  customLines?: BillingCustomLineInput[];
  policies?: BillingOfferPolicyInput[];
  couponCode?: string;
  referralCode?: string;
  operatorAdjustmentMinor?: number;
  paymentMode?: "DEPOSIT" | "FULL";
  projectId?: string;
  now?: Date;
}): BillingPreviewResult {
  const now = input.now ?? new Date();
  const paymentMode = input.paymentMode ?? input.config.defaultPaymentMode;
  const lines = [
    ...buildCatalogLines({
      catalog: input.catalog,
      selections: input.selections,
    }),
    ...buildCustomLines({
      customLines: input.customLines,
    }),
  ];

  if (lines.length === 0) {
    return {
      currency: input.config.currency,
      paymentMode,
      subtotalMinor: 0,
      discountMinor: 0,
      totalMinor: 0,
      payableTodayMinor: 0,
      remainingAfterTodayMinor: 0,
      lines: [],
      appliedOfferCodes: [],
      issues: ["empty_selection"],
    };
  }

  const subtotalMinor = lines.reduce((sum, line) => sum + line.lineSubtotalMinor, 0);
  const resolvedPolicies = buildEligibleOfferPolicies({
    config: input.config,
    policies: input.policies,
    couponCode: input.couponCode,
    referralCode: input.referralCode,
    paymentMode,
    subtotalMinor,
    projectId: input.projectId,
    now,
  });

  if (
    input.config.allowOperatorOverride &&
    (input.operatorAdjustmentMinor ?? 0) > 0
  ) {
    resolvedPolicies.push({
      code: "OPERATOR_OVERRIDE",
      label: "Operator override",
      stackingMode: "STACKABLE",
      kind: "MONETARY",
      discountType: "FIXED_MINOR",
      discountValue: input.operatorAdjustmentMinor ?? 0,
      maxDiscountMinor: null,
    });
  }

  const appliedOfferCodes: string[] = [];
  let discountMinor = 0;

  for (const policy of resolvedPolicies) {
    if (policy.kind === "DEPOSIT_OVERRIDE") {
      appliedOfferCodes.push(policy.code);
      continue;
    }

    const appliedDiscountMinor = applyDiscountToLines({
      lines,
      policy,
      paymentMode,
    });

    if (appliedDiscountMinor > 0) {
      discountMinor += appliedDiscountMinor;
      appliedOfferCodes.push(policy.code);
    }
  }

  const depositPercentOverride = resolveDepositOverride({
    policies: resolvedPolicies,
    defaultDepositPercent: input.config.defaultDepositPercent,
  });

  for (const line of lines) {
    if (paymentMode === "FULL" || line.billingModel === "FULL") {
      line.payableTodayMinor = line.lineTotalMinor;
      line.remainingAfterTodayMinor = 0;
      continue;
    }

    const depositPercent =
      line.defaultDepositPercent ??
      depositPercentOverride ??
      input.config.defaultDepositPercent ??
      100;
    line.payableTodayMinor = roundMinor((line.lineTotalMinor * depositPercent) / 100);
    line.remainingAfterTodayMinor = line.lineTotalMinor - line.payableTodayMinor;
  }

  const totalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);

  return {
    currency: input.config.currency,
    paymentMode,
    subtotalMinor,
    discountMinor,
    totalMinor,
    payableTodayMinor: lines.reduce((sum, line) => sum + line.payableTodayMinor, 0),
    remainingAfterTodayMinor: lines.reduce(
      (sum, line) => sum + line.remainingAfterTodayMinor,
      0,
    ),
    lines: lines.map(({ defaultDepositPercent: _defaultDepositPercent, ...line }) => line),
    appliedOfferCodes,
    issues: [],
  };
}
