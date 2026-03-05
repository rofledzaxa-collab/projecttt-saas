import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isRefreshTokenValid,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  revokeRefreshToken,
  setAuthCookies
} from "@/lib/auth";

export async function POST() {
  const jar = await cookies();
  const rt = jar.get("refresh_token")?.value;

  if (!rt) return new NextResponse("Missing refresh token", { status: 401 });

  const ok = await isRefreshTokenValid(rt);
  if (!ok) return new NextResponse("Invalid refresh token", { status: 401 });

  const user = verifyRefreshToken(rt);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await revokeRefreshToken(rt);
  await persistRefreshToken(user.sub, refreshToken);

  await setAuthCookies(accessToken, refreshToken);

  return NextResponse.json({ ok: true });
}