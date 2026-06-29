ALTER TABLE jr_admin."User" ADD COLUMN IF NOT EXISTS "loginCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE jr_admin."User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
ALTER TABLE jr_admin."User" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE jr_admin."User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS jr_admin."AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT,
  "entityId" TEXT,
  "details" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES jr_admin."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON jr_admin."AuditLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON jr_admin."AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON jr_admin."AuditLog"("createdAt");
