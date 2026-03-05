"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Onboarding() {
  const [done, setDone] = useState(true);

  useEffect(() => {
    const v = localStorage.getItem("projecttt_onboarding_done");
    setDone(v === "1");
  }, []);

  function finish() {
    localStorage.setItem("projecttt_onboarding_done", "1");
    setDone(true);
  }

  if (done) return null;

  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="text-sm font-semibold">Get started (2 minutes)</div>
          <ol className="list-decimal pl-4 text-sm text-[hsl(var(--muted-foreground))] space-y-1">
            <li>
              Go to <a className="underline" href="/settings">Settings</a> → create an API key.
            </li>
            <li>
              Send a test event to <span className="font-mono">/api/events</span> with <span className="font-mono">x-api-key</span>.
            </li>
            <li>
              Open <a className="underline" href="/dashboard">Dashboard</a> and see charts update.
            </li>
          </ol>
          <div className="flex gap-2">
            <Button onClick={finish}>Done</Button>
            <Button variant="secondary" onClick={() => window.open("/settings", "_self")}>Go to Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}