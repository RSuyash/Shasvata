ALTER TABLE "ProjectLead"
ADD COLUMN "sourceSubmissionId" TEXT;

CREATE UNIQUE INDEX "ProjectLead_sourceSubmissionId_key"
ON "ProjectLead"("sourceSubmissionId");

ALTER TABLE "ProjectLead"
ADD CONSTRAINT "ProjectLead_sourceSubmissionId_fkey"
FOREIGN KEY ("sourceSubmissionId") REFERENCES "LeadSubmission"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
