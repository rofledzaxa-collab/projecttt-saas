import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const jar = await cookies();
  const token = jar.get("access_token")?.value;
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const payload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, name: true, role: true, plan: true, createdAt: true } });
  return NextResponse.json({ user });
}
