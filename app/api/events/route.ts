import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { findUserIdByApiKey, audit } from "@/lib/api-keys";

const schema = z.object({
  sessionId: z.string().min(3).max(120),
  type: z.string().min(2).max(50),
  path: z.string().max(200).optional(),
  referrer: z.string().max(200).optional(),
  device: z.string().max(30).optional(),
  country: z.string().max(2).optional(),
  metadata: z.record(z.any()).optional()
});

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,x-api-key,authorization",
    "Access-Control-Max-Age": "86400"
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const extraHeaders = corsHeaders(origin);

  // 1) API key (server-to-server OR browser snippet)
  const apiKey =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  let userId: string | null = null;

  if (apiKey) {
    userId = await findUserIdByApiKey(apiKey);
  }

  // 2) fallback: cookie auth (browser logged in)
  if (!userId) {
    const token = cookies().get("access_token")?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 401, headers: extraHeaders });

    try {
      userId = verifyAccessToken(token).sub;
    } catch {
      return new NextResponse("Unauthorized", { status: 401, headers: extraHeaders });
    }
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) return new NextResponse("Invalid payload", { status: 400, headers: extraHeaders });

  await prisma.event.create({
    data: {
      userId,
      sessionId: body.data.sessionId,
      type: body.data.type,
      path: body.data.path,
      referrer: body.data.referrer,
      device: body.data.device,
      country: body.data.country,
      metadata: body.data.metadata
    }
  });

  // audit only important events (less noise)
  if (["purchase", "checkout_start"].includes(body.data.type)) {
    await audit(userId, "event_ingested", req, { type: body.data.type, sessionId: body.data.sessionId });
  }

  return NextResponse.json({ ok: true }, { headers: extraHeaders });
}