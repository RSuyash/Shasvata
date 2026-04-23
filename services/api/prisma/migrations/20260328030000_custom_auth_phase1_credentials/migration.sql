CREATE TYPE "AuthCredentialKind" AS ENUM ('PASSWORD', 'MAGIC_LINK_ONLY');

CREATE TABLE "AuthCredential" (
    "portalUserId" TEXT NOT NULL,
    "kind" "AuthCredentialKind" NOT NULL DEFAULT 'MAGIC_LINK_ONLY',
    "passwordHash" TEXT,
    "passwordUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthCredential_pkey" PRIMARY KEY ("portalUserId")
);

CREATE INDEX "AuthCredential_kind_updatedAt_idx" ON "AuthCredential"("kind", "updatedAt");

ALTER TABLE "AuthCredential" ADD CONSTRAINT "AuthCredential_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
