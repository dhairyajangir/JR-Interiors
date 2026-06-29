CREATE TABLE IF NOT EXISTS public."Consultation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "projectType" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Consultation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Consultation_userId_idx" ON public."Consultation"("userId");
CREATE INDEX IF NOT EXISTS "Consultation_status_createdAt_idx" ON public."Consultation"("status", "createdAt");
