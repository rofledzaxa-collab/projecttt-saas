import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isRefreshTokenValid,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setAuthCookies
} from "@/lib/auth";

export async function POST() {
  const jar = await cookies();
  const rt = jar.get("refresh_token")?.value;

  if (!rt) return new NextResponse("Missing refresh token", { status: 401 });

  const ok = await isRefreshTokenValid(rt);
  if (!ok) return new NextResponse("Invalid refresh token", { status: 401 });

  // Decode refresh token -> user payload
  const user = verifyRefreshToken(rt); // { sub, email, role, plan }

  // Issue new tokens
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // Persist new refresh token and invalidate old one (last-token-wins)
  await persistRefreshToken(user.sub, refreshToken);
  // optional: revoke old token to keep DB clean
  // await revokeRefreshToken(rt);

  setAuthCookies(accessToken, refreshToken);

  return NextResponse.json({ ok: true });
}