import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://shasvata.com/app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
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
      },
      // AI Crawlers - allow public commerce pages
      {
        userAgent: "Google-Extended",
        allow: ["/", "/products"],
        disallow: ["/auth/", "/dashboard/", "/projects/", "/invite/", "/api/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/products"],
        disallow: ["/auth/", "/dashboard/", "/projects/", "/invite/", "/api/"],
      },
      {
        userAgent: "Anthropic-ai",
        allow: ["/", "/products"],
        disallow: ["/auth/", "/dashboard/", "/projects/", "/invite/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
