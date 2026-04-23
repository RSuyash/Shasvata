import { serviceTaxonomyNodeSeeds } from "@/data/service-taxonomy";
import type { ServiceTaxonomyNodeSeed, ServiceNodeKind, ServiceDomain } from "@/data/service-taxonomy";

// ─── Lookup by slug ──────────────────────────────────────────
export function findNodeBySlug(slug: string): ServiceTaxonomyNodeSeed | undefined {
  return serviceTaxonomyNodeSeeds.find((n) => n.slug === slug);
}

// ─── Children of a node ──────────────────────────────────────
export function getChildrenOf(parentId: string): ServiceTaxonomyNodeSeed[] {
  return serviceTaxonomyNodeSeeds
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// ─── All nodes of a kind ─────────────────────────────────────
export function getNodesByKind(kind: ServiceNodeKind): ServiceTaxonomyNodeSeed[] {
  return serviceTaxonomyNodeSeeds
    .filter((n) => n.kind === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// ─── Domain nodes ────────────────────────────────────────────
export function getDomains(): ServiceTaxonomyNodeSeed[] {
  return getNodesByKind("DOMAIN");
}

// ─── Build breadcrumb trail ──────────────────────────────────
export type BreadcrumbItem = {
  label: string;
  href: string;
};

export function buildBreadcrumbs(nodeId: string): BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [];
  let current = serviceTaxonomyNodeSeeds.find((n) => n.id === nodeId);

  while (current) {
    trail.unshift({
      label: current.label,
      href: buildServicePath(current),
    });

    if (current.parentId) {
      current = serviceTaxonomyNodeSeeds.find((n) => n.id === current!.parentId);
    } else {
      break;
    }
  }

  // Prepend Services root
  trail.unshift({ label: "Services", href: "/services" });

  return trail;
}

// ─── Build URL path for a node ───────────────────────────────
export function buildServicePath(node: ServiceTaxonomyNodeSeed): string {
  switch (node.kind) {
    case "DOMAIN":
      return `/services/${node.slug}`;
    case "CATEGORY": {
      const domain = serviceTaxonomyNodeSeeds.find((n) => n.id === node.parentId);
      if (!domain) return `/services/${node.slug}`;
      return `/services/${domain.slug}/${node.slug}`;
    }
    case "SERVICE":
    case "CAPABILITY": {
      const category = serviceTaxonomyNodeSeeds.find((n) => n.id === node.parentId);
      if (!category) return `/services/${node.slug}`;
      const domain = serviceTaxonomyNodeSeeds.find((n) => n.id === category.parentId);
      if (!domain) return `/services/${category.slug}/${node.slug}`;
      return `/services/${domain.slug}/${category.slug}/${node.slug}`;
    }
    default:
      return `/services/${node.slug}`;
  }
}

// ─── Domain accent colours ───────────────────────────────────
export const domainAccent: Record<ServiceDomain, {
  gradient: string;
  text: string;
  bg: string;
  border: string;
  icon: string;
}> = {
  TECH: {
    gradient: "from-blue-600 via-indigo-500 to-sky-400",
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "🔧",
  },
  MARKETING: {
    gradient: "from-emerald-500 via-teal-500 to-cyan-400",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "📈",
  },
  ADVISORY: {
    gradient: "from-violet-500 via-purple-500 to-fuchsia-400",
    text: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "🧠",
  },
};
