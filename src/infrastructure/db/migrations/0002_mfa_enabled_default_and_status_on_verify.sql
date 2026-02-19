-- MFA is required for all users (email code flow). Set default and backfill.
ALTER TABLE "users" ALTER COLUMN "mfa_enabled" SET DEFAULT true;
UPDATE "users" SET "mfa_enabled" = true WHERE "mfa_enabled" = false;

-- Users who have verified email should be active (fixes existing rows and aligns with verify-email use case).
UPDATE "users" SET "status" = 'active' WHERE "email_verified" = true AND "status" = 'pending';
