import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { OrganizationSchema, WebSiteSchema } from "@/components/ui/structured-data";
import { siteConfig } from "@/content/site";

describe("public SEO metadata", () => {
  it("publishes crawl rules with sitemap discovery and AI-reader allow rules", () => {
    const metadata = robots();

    expect(metadata.host).toBe(siteConfig.url);
    expect(metadata.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
    expect(metadata.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: "*",
          allow: "/",
          disallow: ["/api/"],
        }),
        expect.objectContaining({ userAgent: "Google-Extended", allow: "/" }),
        expect.objectContaining({ userAgent: "GPTBot", allow: "/" }),
        expect.objectContaining({ userAgent: "Anthropic-ai", allow: "/" }),
      ]),
    );
  });

  it("includes the pricing page in the public sitemap", () => {
    const entries = sitemap();

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `${siteConfig.url}/pricing`,
        }),
      ]),
    );
  });

  it("renders JSON-LD into the server HTML output", () => {
    const organizationMarkup = renderToStaticMarkup(createElement(OrganizationSchema));
    const websiteMarkup = renderToStaticMarkup(createElement(WebSiteSchema));

    expect(organizationMarkup).toContain("application/ld+json");
    expect(organizationMarkup).toContain(siteConfig.name);
    expect(websiteMarkup).toContain("application/ld+json");
    expect(websiteMarkup).toContain('"@type":"WebSite"');
  });
});
