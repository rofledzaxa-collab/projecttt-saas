import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookies, revokeRefreshToken } from "@/lib/auth";

export async function POST() {
  const rt = cookies().get("refresh_token")?.value;
  if (rt) await revokeRefreshToken(rt);
  clearAuthCookies();
  return NextResponse.json({ ok: true });
}
