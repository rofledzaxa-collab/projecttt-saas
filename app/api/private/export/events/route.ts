import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const jar = await cookies();
  const token = jar.get("access_token")?.value;
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const payload = verifyAccessToken(token);

  const url = new URL(req.url);
  const days = Math.max(1, Math.min(365, Number(url.searchParams.get("days") ?? "30")));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await prisma.event.findMany({
    where: { userId: payload.sub, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 20000
  });

  const header = ["createdAt", "sessionId", "type", "path", "referrer", "device", "country", "metadata"].join(",");
  const lines = events.map((e) => {
    const meta = e.metadata ? JSON.stringify(e.metadata).replaceAll('"', '""') : "";
    const row = [
      e.createdAt.toISOString(),
      e.sessionId,
      e.type,
      e.path ?? "",
      e.referrer ?? "",
      e.device ?? "",
      e.country ?? "",
      `"${meta}"`
    ];
    return row.map((x) => String(x).replaceAll("\n", " ")).join(",");
  });

  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="projecttt-events-${days}d.csv"`
    }
  });
}