CREATE TYPE "GoogleAdsConversionMode" AS ENUM ('DIRECT_LABEL', 'GA4_IMPORTED');

ALTER TABLE "ProjectSite"
ADD COLUMN "googleAdsConversionMode" "GoogleAdsConversionMode" NOT NULL DEFAULT 'DIRECT_LABEL';
