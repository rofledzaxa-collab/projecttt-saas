import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const jar = await cookies();
const token = jar.get("access_token")?.value;
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const payload = verifyAccessToken(token);
  const me = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!me || me.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { email: true } } }
  });

  return NextResponse.json({ logs });
}