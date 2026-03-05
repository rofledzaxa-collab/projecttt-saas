"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PlanSwitcher({ currentPlan }: { currentPlan: "FREE" | "PRO" }) {
  const [plan, setPlan] = useState(currentPlan);
  const [loading, setLoading] = useState(false);

  async function set(newPlan: "FREE" | "PRO") {
    setLoading(true);
    const r = await fetch("/api/private/plan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan: newPlan }) });
    setLoading(false);
    if (r.ok) setPlan(newPlan);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm">Current: <span className="font-semibold">{plan}</span></div>
      <Button variant="secondary" onClick={() => set("FREE")} disabled={loading || plan === "FREE"}>Switch to FREE</Button>
      <Button onClick={() => set("PRO")} disabled={loading || plan === "PRO"}>Switch to PRO</Button>
      <div className="text-xs text-[hsl(var(--muted-foreground))]">Mocked billing: toggles features for demo.</div>
    </div>
  );
}
