import type { MetadataRoute } from "next";
import { siteConfig, insightArticles } from "@/content/site";
import { serviceTaxonomyNodeSeeds } from "@/data/service-taxonomy";
import { buildServicePath } from "@/lib/taxonomy-helpers";

const BASE_URL = siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE_URL}/capabilities`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/solutions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/work`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/insights`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Service taxonomy pages
  const serviceRoutes: MetadataRoute.Sitemap = serviceTaxonomyNodeSeeds
    .filter((n) => n.kind === "DOMAIN" || n.kind === "CATEGORY" || n.kind === "SERVICE")
    .map((node) => ({
      url: `${BASE_URL}${buildServicePath(node)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: node.kind === "DOMAIN" ? 0.9 : node.kind === "CATEGORY" ? 0.8 : 0.7,
    }));

  const articleRoutes: MetadataRoute.Sitemap = insightArticles.map((article) => ({
    url: `${BASE_URL}/insights/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes, ...articleRoutes];
}
