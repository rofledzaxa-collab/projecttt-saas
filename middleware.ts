import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * IMPORTANT:
 * Middleware runs on Edge runtime.
 * Do NOT import Prisma (or anything that imports Prisma) here.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Minimal security headers (no Prisma, no Node-only libs)
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  return res;
}

// Apply only to pages, not static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};