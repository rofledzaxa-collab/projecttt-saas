import { NextRequest, NextResponse } from "next/server";
import { securityHeaders } from "@/lib/security";
import { rateLimit } from "@/lib/ratelimit";
import { verifyAccessToken } from "@/lib/auth";

const PROTECTED = ["/dashboard", "/analytics", "/segments", "/settings", "/admin", "/api/private"];
const AUTH_PAGES = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // Secure headers
  const headers = securityHeaders();
  Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));

  // Rate limit APIs
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const key = `${ip}:${pathname}`;
    const rl = rateLimit(key, 120, 60_000);
    res.headers.set("X-RateLimit-Remaining", String(rl.remaining));
    res.headers.set("X-RateLimit-Reset", String(Math.floor(rl.resetAt / 1000)));
    if (!rl.ok) return new NextResponse("Too Many Requests", { status: 429, headers: res.headers });
  }

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  const access = req.cookies.get("access_token")?.value;
  const hasAccess = !!access;

  if (isProtected && !hasAccess) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasAccess) {
    // If token is invalid, allow to login
    try {
      verifyAccessToken(access!);
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    } catch {
      // ignore
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
