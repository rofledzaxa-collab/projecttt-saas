import { cookies } from "next/headers";

export function securityHeaders() {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ].join("; ")
  } as const;
}

type CookieOpts = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
};

/**
 * Set auth cookies (access + refresh).
 * Works for App Router route handlers.
 */
export function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar: any = (cookies as any)();

  const common: CookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  };

  jar.set("access_token", accessToken, { ...common, maxAge: 60 * 15 }); // 15m
  jar.set("refresh_token", refreshToken, { ...common, maxAge: 60 * 60 * 24 * 14 }); // 14d
}

/**
 * Clear auth cookies (access + refresh).
 * Some call sites import this name.
 */
export function clearAuthCookies() {
  const jar: any = (cookies as any)();

  jar.set("access_token", "", { path: "/", maxAge: 0 });
  jar.set("refresh_token", "", { path: "/", maxAge: 0 });
}