import { cache } from "react";
import { headers } from "next/headers";

export type ServiceDomain = "MARKETING" | "TECH" | "ADVISORY";
export type ServiceNodeKind = "DOMAIN" | "CATEGORY" | "SERVICE" | "CAPABILITY";
export type ServiceEdgeKind = "CONTAINS" | "RELATED_TO" | "REQUIRES" | "SUPPORTS";

export type ServiceTaxonomyNode = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  summary: string | null;
  route: string | null;
  icon: string | null;
  domain: ServiceDomain;
  kind: ServiceNodeKind;
  sortOrder: number;
  isFeatured: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children: ServiceTaxonomyNode[];
};

export type ServiceTaxonomyEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  kind: ServiceEdgeKind;
  weight: number;
  note: string | null;
};

export type ServiceTaxonomyResponse = {
  roots: ServiceTaxonomyNode[];
  nodes: Omit<ServiceTaxonomyNode, "children">[];
  edges: ServiceTaxonomyEdge[];
};

import {
  serviceTaxonomyEdgeSeeds,
  serviceTaxonomyNodeSeeds,
} from "@/data/service-taxonomy";

export const getServiceTaxonomy = cache(async (): Promise<ServiceTaxonomyResponse> => {
  const now = new Date().toISOString();
  const nodeMap = new Map<string, ServiceTaxonomyNode>();

  for (const seed of serviceTaxonomyNodeSeeds) {
    nodeMap.set(seed.id, {
      id: seed.id,
      slug: seed.slug,
      label: seed.label,
      description: seed.description ?? null,
      summary: seed.summary ?? null,
      route: seed.route ?? null,
      icon: seed.icon ?? null,
      domain: seed.domain,
      kind: seed.kind,
      sortOrder: seed.sortOrder,
      isFeatured: seed.isFeatured ?? false,
      parentId: seed.parentId ?? null,
      createdAt: now,
      updatedAt: now,
      children: [],
    });
  }

  const roots: ServiceTaxonomyNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: ServiceTaxonomyNode[]): ServiceTaxonomyNode[] =>
    nodes
      .sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label))
      .map((node) => ({ ...node, children: sortNodes(node.children) }));

  const nodes = Array.from(nodeMap.values()).map(({ children, ...node }) => node);

  return {
    roots: sortNodes(roots),
    nodes: nodes.sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label)),
    edges: serviceTaxonomyEdgeSeeds.map((edge, index) => ({
      id: `edge_${index}`,
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      kind: edge.kind,
      weight: edge.weight ?? 1,
      note: edge.note ?? null,
    })),
  };
});