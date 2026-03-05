import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isRefreshTokenValid,
  rotateRefreshToken,
  signAccessToken
} from "@/lib/auth";
import { setAuthCookies } from "@/lib/security";

export async function POST() {
  // Next 15: cookies() может быть async в типах -> всегда await
  const jar = await cookies();
  const rt = jar.get("refresh_token")?.value;

  if (!rt) return new NextResponse("Missing refresh token", { status: 401 });

  const ok = await isRefreshTokenValid(rt);
  if (!ok) return new NextResponse("Invalid refresh token", { status: 401 });

  // Меняем refresh токен (ротация) и выдаём новый access
  const { refreshToken, userId } = await rotateRefreshToken(rt);
  const accessToken = await signAccessToken(userId);

  setAuthCookies(accessToken, refreshToken);

  return NextResponse.json({ ok: true });
}