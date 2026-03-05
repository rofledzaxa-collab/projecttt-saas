import crypto from "crypto";
import { prisma } from "@/lib/db";

export function generateApiKey() {
  const raw = crypto.randomBytes(32).toString("base64url");
  const prefix = raw.slice(0, 8);
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

export async function findUserIdByApiKey(rawKey: string) {
  const hash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const key = await prisma.apiKey.findUnique({ where: { keyHash: hash } });
  if (!key) return null;
  if (key.revokedAt) return null;

  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() }
  });

  return key.userId;
}

export async function audit(userId: string, action: string, req: Request, meta?: any) {
  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;

  const userAgent = req.headers.get("user-agent");

  await prisma.auditLog.create({
    data: {
      userId,
      action,
      ip,
      userAgent,
      meta: meta ?? undefined
    }
  });
}