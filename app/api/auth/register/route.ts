import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setAuthCookies
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80).optional().or(z.literal("")),
  password: z.string().min(8).max(200)
});

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return new NextResponse("Bad Request", { status: 400 });

  const email = body.data.email.toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return new NextResponse("Email already in use", { status: 409 });

  const passwordHash = await hashPassword(body.data.password);

  const user = await prisma.user.create({
    data: { email, name: body.data.name || null, passwordHash }
  });

  const payload = { sub: user.id, email: user.email, role: user.role, plan: user.plan } as const;

  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);

  await persistRefreshToken(user.id, refresh);
  await setAuthCookies(access, refresh);

  return NextResponse.json({ ok: true });
}