import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, signAccessToken, signRefreshToken, setAuthCookies, persistRefreshToken } from "@/lib/auth";
import { logger } from "@/lib/logger";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80).optional().or(z.literal("")),
  password: z.string().min(8).max(200)
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return new NextResponse("Email already in use", { status: 409 });

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: { email, name: body.name || null, passwordHash }
    });

    const payload = { sub: user.id, email: user.email, role: user.role, plan: user.plan } as const;
    const access = signAccessToken(payload);
    const refresh = signRefreshToken(payload);
    await persistRefreshToken(user.id, refresh);
    setAuthCookies(access, refresh);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    logger.warn({ err: e }, "register_failed");
    return new NextResponse(e?.message ?? "Bad Request", { status: 400 });
  }
}
