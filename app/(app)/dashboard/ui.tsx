import { prisma } from "@/lib/db";
import { DailyEventsChart, FunnelChart } from "./widgets";

export async function DashboardCharts({ userId }: { userId: string }) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const events = await prisma.event.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { type: true, createdAt: true },
    orderBy: { createdAt: "asc" }
  });

  const byDay = new Map<string, number>();
  for (const e of events) {
    const d = new Date(e.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  const daily = Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));

  const funnel = {
    views: events.filter(e => e.type === "page_view").length,
    cart: events.filter(e => e.type === "add_to_cart").length,
    checkout: events.filter(e => e.type === "checkout_start").length,
    purchase: events.filter(e => e.type === "purchase").length
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DailyEventsChart data={daily} />
      <FunnelChart data={funnel} />
    </div>
  );
}
