type AppLinkInput = {
  packageSlug?: string;
  addonSlugs?: string[];
  quoteSlugs?: string[];
  couponCode?: string;
  referralCode?: string;
};

export function getAppPortalUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://shasvata.com/app";
}

export function buildAppPortalLink(input: AppLinkInput): string {
  const url = new URL(getAppPortalUrl());
  const basePath = url.pathname.replace(/\/+$/, "");
  url.pathname = `${basePath}/dashboard/products`;

  if (input.packageSlug) {
    url.searchParams.set("package", input.packageSlug);
  }

  if (input.addonSlugs?.length) {
    url.searchParams.set("addons", input.addonSlugs.join(","));
  }

  if (input.quoteSlugs?.length) {
    url.searchParams.set("quotes", input.quoteSlugs.join(","));
  }

  if (input.couponCode) {
    url.searchParams.set("coupon", input.couponCode);
  }

  if (input.referralCode) {
    url.searchParams.set("ref", input.referralCode);
  }

  return url.toString();
}
