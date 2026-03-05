import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isRefreshTokenValid, verifyRefreshToken, signAccessToken, setAuthCookies } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const rt = cookies().get("refresh_token")?.value;
  if (!rt) return new NextResponse("Missing refresh token", { status: 401 });

  const ok = await isRefreshTokenValid(rt);
  if (!ok) return new NextResponse("Refresh token revoked", { status: 401 });

  const payload = verifyRefreshToken(rt);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return new NextResponse("User missing", { status: 401 });

  const access = signAccessToken({ sub: user.id, email: user.email, role: user.role, plan: user.plan });
  setAuthCookies(access, rt);
  return NextResponse.json({ ok: true });
}
