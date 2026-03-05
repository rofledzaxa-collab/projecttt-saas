import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { audit } from "@/lib/api-keys";

const schema = z.object({ id: z.string().min(10) });

export async function POST(req: Request) {
  const jar = await cookies();
  const token = jar.get("access_token")?.value;
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const payload = verifyAccessToken(token);
  const body = schema.safeParse(await req.json());
  if (!body.success) return new NextResponse("Bad request", { status: 400 });

  const key = await prisma.apiKey.findFirst({ where: { id: body.data.id, userId: payload.sub } });
  if (!key) return new NextResponse("Not found", { status: 404 });

  await prisma.apiKey.update({ where: { id: key.id }, data: { revokedAt: new Date() } });
  await audit(payload.sub, "api_key_revoked", req, { keyId: key.id });

  return NextResponse.json({ ok: true });
}