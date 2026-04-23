CREATE TYPE "ProjectSiteSourceProvider" AS ENUM ('GIT_REPOSITORY');

CREATE TYPE "ProjectSiteRuntimeProfile" AS ENUM ('STATIC_ARTIFACT', 'ISOLATED_APP');

ALTER TABLE "Project"
ADD COLUMN "clientCompanyName" TEXT,
ADD COLUMN "goLiveAt" TIMESTAMP(3);

ALTER TABLE "ProjectSite"
ADD COLUMN "sourceProvider" "ProjectSiteSourceProvider",
ADD COLUMN "repoUrl" TEXT,
ADD COLUMN "repoBranch" TEXT,
ADD COLUMN "repoRef" TEXT,
ADD COLUMN "deployedCommit" TEXT,
ADD COLUMN "runtimeProfile" "ProjectSiteRuntimeProfile" NOT NULL DEFAULT 'STATIC_ARTIFACT',
ADD COLUMN "operatorNotes" TEXT,
ADD COLUMN "previewHost" TEXT;

CREATE UNIQUE INDEX "ProjectSite_previewHost_key" ON "ProjectSite"("previewHost");
