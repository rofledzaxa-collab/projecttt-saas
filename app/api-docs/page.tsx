"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    fetch("/api/openapi").then(r => r.json()).then(setSpec);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>API Docs</CardTitle>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">OpenAPI JSON is available at <span className="font-mono">/api/openapi</span>.</div>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-x-auto rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--secondary))]">
              {spec ? JSON.stringify(spec, null, 2) : "Loading..."}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
