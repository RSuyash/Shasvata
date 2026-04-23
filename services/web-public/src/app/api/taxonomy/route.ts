import { NextResponse } from "next/server";
import {
  serviceTaxonomyEdgeSeeds,
  serviceTaxonomyNodeSeeds,
} from "../../../data/service-taxonomy";

type TaxonomyNode = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  summary: string | null;
  route: string | null;
  icon: string | null;
  domain: "MARKETING" | "TECH" | "ADVISORY";
  kind: "DOMAIN" | "CATEGORY" | "SERVICE" | "CAPABILITY";
  sortOrder: number;
  isFeatured: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children: TaxonomyNode[];
};

function buildResponse() {
  const now = new Date().toISOString();
  const nodeMap = new Map<string, TaxonomyNode>();

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

  const roots: TaxonomyNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: TaxonomyNode[]): TaxonomyNode[] =>
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
}

export async function GET() {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  try {
    const response = await fetch(`${apiUrl}/api/taxonomy`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }
  } catch {
    // Fall through to the embedded taxonomy when the API is offline in local dev.
  }

  return NextResponse.json(buildResponse());
}
