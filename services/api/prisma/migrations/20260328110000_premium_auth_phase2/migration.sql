ALTER TYPE "AuthCredentialKind" ADD VALUE IF NOT EXISTS 'GOOGLE_OIDC';
ALTER TYPE "AuthCredentialKind" ADD VALUE IF NOT EXISTS 'PASSWORD_AND_GOOGLE';

ALTER TABLE "PortalUser"
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

ALTER TABLE "AuthCredential"
ADD COLUMN "googleSubject" TEXT,
ADD COLUMN "googleEmail" TEXT;

CREATE UNIQUE INDEX "AuthCredential_googleSubject_key" ON "AuthCredential"("googleSubject");

CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "verifierHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailVerificationToken_selector_key" ON "EmailVerificationToken"("selector");
CREATE INDEX "EmailVerificationToken_portalUserId_expiresAt_idx" ON "EmailVerificationToken"("portalUserId", "expiresAt");
CREATE INDEX "EmailVerificationToken_email_expiresAt_idx" ON "EmailVerificationToken"("email", "expiresAt");

ALTER TABLE "EmailVerificationToken"
ADD CONSTRAINT "EmailVerificationToken_portalUserId_fkey"
FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "verifierHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_selector_key" ON "PasswordResetToken"("selector");
CREATE INDEX "PasswordResetToken_portalUserId_expiresAt_idx" ON "PasswordResetToken"("portalUserId", "expiresAt");

ALTER TABLE "PasswordResetToken"
ADD CONSTRAINT "PasswordResetToken_portalUserId_fkey"
FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
