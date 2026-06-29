"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ConsultationSchema } from "@/lib/validation";
import { validateFormSecurity } from "@/lib/security-helpers";

export type ConsultationFormState =
  | {
      ok?: boolean;
      error?: string;
    }
  | undefined;

function str(fd: FormData, key: string): string {
  return ((fd.get(key) as string) ?? "").trim();
}

export async function requestConsultation(
  _prev: ConsultationFormState,
  formData: FormData
): Promise<ConsultationFormState> {
  // 1. Enforce form security (Rate limiting, Honeypot, Turnstile)
  const security = await validateFormSecurity(formData, "consultation", 5, 300_000);
  if (security.isSpam) {
    // Fail silently for spam bot submissions
    return { ok: true };
  }
  if (security.error) {
    return { error: security.error };
  }

  // 2. Parse and validate inputs with Zod
  const name = str(formData, "name");
  const email = str(formData, "email");
  const phone = str(formData, "phone") || null;
  const projectType = str(formData, "projectType") || "Single room";
  const consultation = str(formData, "consultation") || "virtual";
  const rawMessage = str(formData, "message");
  const message = rawMessage
    ? `${rawMessage} (Preferred consultation: ${consultation === "in-home" ? "In-home" : "Virtual"})`
    : `Preferred consultation: ${consultation === "in-home" ? "In-home" : "Virtual"}`;

  const parsed = ConsultationSchema.safeParse({
    name,
    email,
    phone,
    projectType,
    message,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const user = await getCurrentUser();

  await prisma.consultation.create({
    data: {
      userId: user?.id ?? null,
      name: parsed.data.name as string,
      email: parsed.data.email as string,
      phone: parsed.data.phone as string | null,
      projectType: parsed.data.projectType as string,
      message: parsed.data.message as string | null,
    },
  });

  return { ok: true };
}
