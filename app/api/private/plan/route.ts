import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ plan: z.enum(["FREE","PRO"]) });

export async function POST(req: Request) {
  const token = cookies().get("access_token")?.value;
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const payload = verifyAccessToken(token);
  const body = schema.safeParse(await req.json());
  if (!body.success) return new NextResponse("Bad request", { status: 400 });

  await prisma.user.update({ where: { id: payload.sub }, data: { plan: body.data.plan } });

  return NextResponse.json({ ok: true });
}
