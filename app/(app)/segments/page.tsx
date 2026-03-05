import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/session";
import { conversionProbability, segmentFromProbability } from "@/lib/ai";

export default async function SegmentsPage() {
  const user = await getCurrentUser();
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

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

  const segCount = { A: 0, B: 0, C: 0 };
  for (const [, ev] of sessions) {
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
    if (seg.startsWith("A")) segCount.A++;
    else if (seg.startsWith("B")) segCount.B++;
    else segCount.C++;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Segments</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Audience heatmap based on session intent.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>A (Hot)</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{segCount.A}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>B (Warm)</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{segCount.B}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>C (Cold)</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{segCount.C}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>How it works</CardTitle></CardHeader>
        <CardContent className="text-sm text-[hsl(var(--muted-foreground))] space-y-2">
          <p>We compute explainable features (page views, cart actions, checkout starts, recency) and run them through a logistic model.</p>
          <p>This is ideal for a portfolio: it looks like AI, but is deterministic, fast, and easy to explain to clients.</p>
        </CardContent>
      </Card>
    </div>
  );
}
