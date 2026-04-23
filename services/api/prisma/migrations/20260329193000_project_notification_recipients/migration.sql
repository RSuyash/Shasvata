CREATE TABLE "ProjectNotificationRecipient" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectNotificationRecipient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectNotificationRecipient_projectId_email_key" ON "ProjectNotificationRecipient"("projectId", "email");
CREATE INDEX "ProjectNotificationRecipient_projectId_createdAt_idx" ON "ProjectNotificationRecipient"("projectId", "createdAt");

ALTER TABLE "ProjectNotificationRecipient"
ADD CONSTRAINT "ProjectNotificationRecipient_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
