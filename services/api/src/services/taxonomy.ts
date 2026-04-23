import type { ServiceDomain, ServiceEdgeKind, ServiceNodeKind } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  serviceTaxonomyEdgeSeeds,
  serviceTaxonomyNodeSeeds,
  type ServiceTaxonomyNodeSeed,
} from "../data/service-taxonomy.js";

type TaxonomyNodeRecord = {
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
  createdAt: Date;
  updatedAt: Date;
};

type TaxonomyEdgeRecord = {
  id: string;
  sourceId: string;
  targetId: string;
  kind: ServiceEdgeKind;
  weight: number;
  note: string | null;
  createdAt: Date;
};

export type ServiceTaxonomyNode = TaxonomyNodeRecord & {
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

async function seedTaxonomyIfNeeded(): Promise<void> {
  const existingCount = await prisma.serviceTaxonomyNode.count();
  if (existingCount > 0) return;

  await prisma.$transaction([
    prisma.serviceTaxonomyNode.createMany({
      data: serviceTaxonomyNodeSeeds.map((node: ServiceTaxonomyNodeSeed) => ({
        id: node.id,
        slug: node.slug,
        label: node.label,
        description: node.description ?? null,
        summary: node.summary ?? null,
        route: node.route ?? null,
        icon: node.icon ?? null,
        domain: node.domain,
        kind: node.kind,
        sortOrder: node.sortOrder,
        isFeatured: node.isFeatured ?? false,
        parentId: node.parentId ?? null,
      })),
    }),
    prisma.serviceTaxonomyEdge.createMany({
      data: serviceTaxonomyEdgeSeeds.map((edge) => ({
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        kind: edge.kind,
        weight: edge.weight ?? 1,
        note: edge.note ?? null,
      })),
    }),
  ]);
}

function sortNodes(nodes: ServiceTaxonomyNode[]): ServiceTaxonomyNode[] {
  return nodes
    .sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label))
    .map((node) => ({
      ...node,
      children: sortNodes(node.children),
    }));
}

function buildTree(nodes: TaxonomyNodeRecord[], edges: TaxonomyEdgeRecord[]): ServiceTaxonomyResponse {
  const nodeMap = new Map<string, ServiceTaxonomyNode>();

  for (const node of nodes) {
    nodeMap.set(node.id, { ...node, children: [] });
  }

  const roots: ServiceTaxonomyNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const flatNodes = Array.from(nodeMap.values()).map(({ children: _children, ...node }) => node);

  return {
    roots: sortNodes(roots),
    nodes: flatNodes.sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label)),
    edges: edges.map((edge) => ({
      id: edge.id,
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      kind: edge.kind,
      weight: edge.weight,
      note: edge.note,
    })),
  };
}

export async function getServiceTaxonomy(): Promise<ServiceTaxonomyResponse> {
  await seedTaxonomyIfNeeded();

  const [nodes, edges] = await Promise.all([
    prisma.serviceTaxonomyNode.findMany(),
    prisma.serviceTaxonomyEdge.findMany(),
  ]);

  return buildTree(nodes, edges);
}
