CREATE TYPE "ServiceDomain" AS ENUM ('MARKETING', 'TECH', 'ADVISORY');
CREATE TYPE "ServiceNodeKind" AS ENUM ('DOMAIN', 'CATEGORY', 'SERVICE', 'CAPABILITY');
CREATE TYPE "ServiceEdgeKind" AS ENUM ('CONTAINS', 'RELATED_TO', 'REQUIRES', 'SUPPORTS');

CREATE TABLE "ServiceTaxonomyNode" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "summary" TEXT,
    "route" TEXT,
    "icon" TEXT,
    "domain" "ServiceDomain" NOT NULL,
    "kind" "ServiceNodeKind" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTaxonomyNode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceTaxonomyEdge" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "kind" "ServiceEdgeKind" NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceTaxonomyEdge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceTaxonomyNode_slug_key" ON "ServiceTaxonomyNode"("slug");
CREATE INDEX "ServiceTaxonomyNode_domain_kind_idx" ON "ServiceTaxonomyNode"("domain", "kind");
CREATE INDEX "ServiceTaxonomyNode_parentId_sortOrder_idx" ON "ServiceTaxonomyNode"("parentId", "sortOrder");
CREATE INDEX "ServiceTaxonomyEdge_kind_idx" ON "ServiceTaxonomyEdge"("kind");
CREATE UNIQUE INDEX "ServiceTaxonomyEdge_sourceId_targetId_kind_key" ON "ServiceTaxonomyEdge"("sourceId", "targetId", "kind");

ALTER TABLE "ServiceTaxonomyNode"
ADD CONSTRAINT "ServiceTaxonomyNode_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "ServiceTaxonomyNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ServiceTaxonomyEdge"
ADD CONSTRAINT "ServiceTaxonomyEdge_sourceId_fkey"
FOREIGN KEY ("sourceId") REFERENCES "ServiceTaxonomyNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ServiceTaxonomyEdge"
ADD CONSTRAINT "ServiceTaxonomyEdge_targetId_fkey"
FOREIGN KEY ("targetId") REFERENCES "ServiceTaxonomyNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;