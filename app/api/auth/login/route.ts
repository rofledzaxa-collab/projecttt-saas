import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, signAccessToken, signRefreshToken, setAuthCookies, persistRefreshToken } from "@/lib/auth";
import { logger } from "@/lib/logger";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200)
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return new NextResponse("Invalid credentials", { status: 401 });

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) return new NextResponse("Invalid credentials", { status: 401 });

    const payload = { sub: user.id, email: user.email, role: user.role, plan: user.plan } as const;
    const access = signAccessToken(payload);
    const refresh = signRefreshToken(payload);
    await persistRefreshToken(user.id, refresh);
    setAuthCookies(access, refresh);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    logger.warn({ err: e }, "login_failed");
    return new NextResponse(e?.message ?? "Bad Request", { status: 400 });
  }
}
