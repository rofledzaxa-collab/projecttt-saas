import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/session";
import { conversionProbability, recommendations, segmentFromProbability } from "@/lib/ai";
import { DashboardCharts } from "./ui";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const events = await prisma.event.findMany({
    where: { userId: user.id, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 2500
  });

  const sessions = new Map<string, typeof events>();
  for (const e of events) {
    const arr = sessions.get(e.sessionId) ?? [];
    arr.push(e);
    sessions.set(e.sessionId, arr);
  }

  const sessionList = Array.from(sessions.entries()).slice(0, 12).map(([sessionId, ev]) => {
    const pageViews = ev.filter((x) => x.type === "page_view").length;
    const addToCart = ev.filter((x) => x.type === "add_to_cart").length;
    const checkoutStart = ev.filter((x) => x.type === "checkout_start").length;
    const purchases = ev.filter((x) => x.type === "purchase").length;
    const searches = ev.filter((x) => x.type === "search").length;
    const last = ev[0]?.createdAt ?? new Date();
    const recencyMinutes = Math.max(0, Math.round((Date.now() - last.getTime()) / 60000));
    const deviceMobile = ev.some((x) => x.device === "mobile") ? 1 : 0;

    const p = conversionProbability({ pageViews, addToCart, checkoutStart, purchases, searches, recencyMinutes, deviceMobile });
    const seg = segmentFromProbability(p);
    const tips = recommendations({ pageViews, addToCart, checkoutStart, purchases, searches, recencyMinutes, deviceMobile }, p);

    return { sessionId, p, seg, last, tips, pageViews, addToCart, checkoutStart, purchases };
  });

  const totalEvents = events.length;
  const totalSessions = sessions.size;
  const purchases = events.filter((e) => e.type === "purchase").length;
  const addToCart = events.filter((e) => e.type === "add_to_cart").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          30-day overview + AI conversion scoring from your event stream.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total events</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{totalEvents}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sessions</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{totalSessions}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Add to cart</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{addToCart}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Purchases</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{purchases}</CardContent>
        </Card>
      </div>

      <DashboardCharts userId={user.id} />

      <Card>
        <CardHeader>
          <CardTitle>Top sessions (AI)</CardTitle>
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Probability, segment, and recommended actions.</div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[hsl(var(--muted-foreground))]">
                <tr>
                  <th className="py-2 pr-4">Session</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Segment</th>
                  <th className="py-2 pr-4">Signals</th>
                  <th className="py-2">Recommendations</th>
                </tr>
              </thead>
              <tbody>
                {sessionList.map((s) => (
                  <tr key={s.sessionId} className="border-t border-[hsl(var(--border))]">
                    <td className="py-3 pr-4 font-mono text-xs">{s.sessionId}</td>
                    <td className="py-3 pr-4 font-semibold">{Math.round(s.p * 100)}%</td>
                    <td className="py-3 pr-4"><Badge>{s.seg}</Badge></td>
                    <td className="py-3 pr-4 text-xs text-[hsl(var(--muted-foreground))]">
                      pv:{s.pageViews} • cart:{s.addToCart} • chk:{s.checkoutStart} • buy:{s.purchases}
                    </td>
                    <td className="py-3 text-xs text-[hsl(var(--muted-foreground))]">
                      <ul className="list-disc pl-4 space-y-1">
                        {s.tips.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
