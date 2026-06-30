import { prisma } from "./db";
import { getClientIp } from "./security-helpers";
import { headers } from "next/headers";

function scrubPayload(data: Record<string, any>): string {
  const scrubbed = { ...data };
  const keysToScrub = ["password", "token", "cookie", "cardNumber", "cvv", "key", "secret"];

  const scrubVal = (obj: any) => {
    if (!obj || typeof obj !== "object") return;
    for (const k of Object.keys(obj)) {
      if (keysToScrub.some((key) => k.toLowerCase().includes(key))) {
        obj[k] = "[SCRUBBED]";
      } else if (typeof obj[k] === "object") {
        scrubVal(obj[k]);
      }
    }
  };

  scrubVal(scrubbed);
  return JSON.stringify(scrubbed);
}

export async function logAudit(
  userId: string,
  action: string,
  params: {
    entity?: string;
    entityId?: string;
    description?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  try {
    const ipAddress = await getClientIp();
    const store = await headers();
    const userAgent = store.get("user-agent");

    let details = params.description || "";
    if (params.metadata) {
      details += ` | Payload: ${scrubPayload(params.metadata)}`;
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: params.entity || null,
        entityId: params.entityId || null,
        details,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}
