import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { audit, generateApiKey } from "@/lib/api-keys";

const createSchema = z.object({
  name: z.string().min(2).max(60)
});

export async function GET() {
  const jar = await cookies();
  const token = jar.get("access_token")?.value;
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const payload = verifyAccessToken(token);

  const keys = await prisma.apiKey.findMany({
    where: { userId: payload.sub },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, prefix: true, lastUsedAt: true, revokedAt: true, createdAt: true }
  });

  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const token = cookies().get("access_token")?.value;
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const payload = verifyAccessToken(token);
  const body = createSchema.safeParse(await req.json());
  if (!body.success) return new NextResponse("Bad request", { status: 400 });

  const { raw, prefix, hash } = generateApiKey();

  const created = await prisma.apiKey.create({
    data: {
      userId: payload.sub,
      name: body.data.name,
      prefix,
      keyHash: hash
    },
    select: { id: true, name: true, prefix: true, createdAt: true }
  });

  await audit(payload.sub, "api_key_created", req, { keyId: created.id, name: created.name });

  // raw key is shown ONCE
  return NextResponse.json({ key: created, rawKey: raw });
}