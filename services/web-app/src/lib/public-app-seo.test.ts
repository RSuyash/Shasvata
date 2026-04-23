import { describe, expect, it } from "vitest";
import robots from "../app/robots";
import sitemap from "../app/sitemap";

const APP_URL = "https://shasvata.com/app";

describe("public app SEO metadata", () => {
  it("only allows the public commerce routes to be crawled", () => {
    const metadata = robots();

    expect(metadata.host).toBe(APP_URL);
    expect(metadata.sitemap).toBe(`${APP_URL}/sitemap.xml`);
    expect(metadata.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: "*",
          allow: [
            "/",
            "/products",
            "/contact",
            "/terms",
            "/privacy",
            "/refunds-cancellations",
          ],
          disallow: [
            "/auth/",
            "/dashboard/",
            "/projects/",
            "/invite/",
            "/api/",
          ],
        }),
        expect.objectContaining({ userAgent: "Google-Extended", allow: ["/", "/products"] }),
      ]),
    );
  });

  it("publishes a sitemap with the app's public routes only", () => {
    const entries = sitemap();

    expect(entries).toEqual([
      expect.objectContaining({ url: APP_URL }),
      expect.objectContaining({ url: `${APP_URL}/products` }),
      expect.objectContaining({ url: `${APP_URL}/contact` }),
      expect.objectContaining({ url: `${APP_URL}/terms` }),
      expect.objectContaining({ url: `${APP_URL}/privacy` }),
      expect.objectContaining({ url: `${APP_URL}/refunds-cancellations` }),
    ]);
  });
});
