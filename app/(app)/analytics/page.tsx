import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/session";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const topPaths = await prisma.event.groupBy({
    by: ["path"],
    where: {
      userId: user.id,
      createdAt: { gte: since },
      path: { not: null }
    },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: 8
  });

  const topRef = await prisma.event.groupBy({
    by: ["referrer"],
    where: {
      userId: user.id,
      createdAt: { gte: since },
      referrer: { not: null }
    },
    _count: { referrer: true },
    orderBy: { _count: { referrer: "desc" } },
    take: 8
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Traffic sources and top content.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top paths</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {topPaths.map((r) => (
                <li key={r.path ?? "null"} className="flex items-center justify-between border-b border-[hsl(var(--border))] py-2">
                  <span className="font-mono text-xs">{r.path}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">{r._count.path}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top referrers</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {topRef.map((r) => (
                <li key={r.referrer ?? "null"} className="flex items-center justify-between border-b border-[hsl(var(--border))] py-2">
                  <span className="font-mono text-xs">{r.referrer}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">{r._count.referrer}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Download events as CSV.</div>
        </CardHeader>
        <CardContent>
          <a
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]"
            href="/api/private/export/events?days=30"
          >
            Export last 30 days (CSV)
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ingestion API</CardTitle><div className="text-sm text-[hsl(var(--muted-foreground))]">Send events to /api/events</div></CardHeader>
        <CardContent>
          <pre className="text-xs overflow-x-auto rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--secondary))]">
{`curl -X POST http://localhost:3000/api/events \\
  -H "content-type: application/json" \\
  -H "x-api-key: YOUR_KEY" \\
  -d '{ "sessionId":"sess_demo", "type":"page_view", "path":"/pricing", "referrer":"google", "device":"desktop", "country":"KZ" }'`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}