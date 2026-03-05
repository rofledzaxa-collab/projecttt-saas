import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeRefreshToken } from "@/lib/auth";

export async function POST() {
  const jar = await cookies();
  const rt = jar.get("refresh_token")?.value;

  if (rt) await revokeRefreshToken(rt);

  // Clear cookies (no dependency on lib/security exports)
  jar.set("access_token", "", { path: "/", maxAge: 0 });
  jar.set("refresh_token", "", { path: "/", maxAge: 0 });

  return NextResponse.json({ ok: true });
}