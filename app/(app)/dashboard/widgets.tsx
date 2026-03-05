"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";

export function DailyEventsChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily events</CardTitle>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">Activity trend (last 30 days)</div>
      </CardHeader>
      <CardContent style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function FunnelChart({ data }: { data: { views: number; cart: number; checkout: number; purchase: number } }) {
  const rows = [
    { stage: "Page views", value: data.views },
    { stage: "Add to cart", value: data.cart },
    { stage: "Checkout start", value: data.checkout },
    { stage: "Purchase", value: data.purchase }
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion funnel</CardTitle>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">From view → purchase</div>
      </CardHeader>
      <CardContent style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
