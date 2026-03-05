import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setAuthCookies
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200)
});

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return new NextResponse("Bad Request", { status: 400 });

  const email = body.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new NextResponse("Invalid credentials", { status: 401 });

  const ok = await verifyPassword(body.data.password, user.passwordHash);
  if (!ok) return new NextResponse("Invalid credentials", { status: 401 });

  const payload = { sub: user.id, email: user.email, role: user.role, plan: user.plan } as const;

  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);

  await persistRefreshToken(user.id, refresh);
  await setAuthCookies(access, refresh);

  return NextResponse.json({ ok: true });
}