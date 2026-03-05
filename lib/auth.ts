import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const accessSecret = process.env.JWT_ACCESS_SECRET!;
const refreshSecret = process.env.JWT_REFRESH_SECRET!;
const accessTtl = Number(process.env.JWT_ACCESS_TTL_SECONDS ?? "900");
const refreshTtl = Number(process.env.JWT_REFRESH_TTL_SECONDS ?? "1209600");

export type JwtUser = {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
  plan: "FREE" | "PRO";
};

export function signAccessToken(payload: JwtUser) {
  return jwt.sign(payload, accessSecret, { expiresIn: accessTtl });
}

export function verifyAccessToken(token: string): JwtUser {
  return jwt.verify(token, accessSecret) as JwtUser;
}

export function signRefreshToken(payload: JwtUser) {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshTtl });
}

export function verifyRefreshToken(token: string): JwtUser {
  return jwt.verify(token, refreshSecret) as JwtUser;
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

/**
 * Next 15: cookies() может быть async в типах -> всегда await cookies()
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const c = await cookies();
  const secure = process.env.NODE_ENV === "production";

  c.set("access_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: accessTtl
  });

  c.set("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: refreshTtl
  });
}

export async function clearAuthCookies() {
  const c = await cookies();
  const secure = process.env.NODE_ENV === "production";

  c.set("access_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0
  });

  c.set("refresh_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0
  });
}

/**
 * Store refresh token server-side (hashed) so it can be revoked.
 */
export async function persistRefreshToken(userId: string, refreshToken: string) {
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const expiresAt = new Date(Date.now() + refreshTtl * 1000);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt }
  });
}

export async function revokeRefreshToken(refreshToken: string) {
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
}

export async function isRefreshTokenValid(refreshToken: string) {
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const found = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!found) return false;
  return found.expiresAt.getTime() > Date.now();
}