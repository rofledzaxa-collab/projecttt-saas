import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeRefreshToken } from "@/lib/auth";
import { clearAuthCookies } from "@/lib/security";

export async function POST() {
  const jar = await cookies(); // Next 15: cookies() can be async in types
  const rt = jar.get("refresh_token")?.value;

  if (rt) await revokeRefreshToken(rt);
  clearAuthCookies();

  return NextResponse.json({ ok: true });
}