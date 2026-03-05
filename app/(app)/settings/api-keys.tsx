"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [name, setName] = useState("Server key");
  const [rawKeyOnce, setRawKeyOnce] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch("/api/private/api-keys");
    if (r.ok) {
      const j = await r.json();
      setKeys(j.keys);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createKey() {
    setLoading(true);
    setRawKeyOnce(null);
    const r = await fetch("/api/private/api-keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name })
    });
    setLoading(false);

    if (!r.ok) return;
    const j = await r.json();
    setRawKeyOnce(j.rawKey);
    await load();
  }

  async function revoke(id: string) {
    setLoading(true);
    const r = await fetch("/api/private/api-keys/revoke", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id })
    });
    setLoading(false);
    if (r.ok) load();
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          For server-to-server event ingestion. Key is shown <b>once</b>.
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name" />
          <Button onClick={createKey} disabled={loading}>Create key</Button>
        </div>

        {rawKeyOnce && (
          <div className="rounded-2xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--secondary))] space-y-2">
            <div className="text-sm font-semibold">Your new key (copy now)</div>
            <div className="font-mono text-xs break-all">{rawKeyOnce}</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => copy(rawKeyOnce)}>Copy</Button>
              <Button variant="ghost" onClick={() => setRawKeyOnce(null)}>Hide</Button>
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              Use header: <span className="font-mono">x-api-key: {rawKeyOnce.slice(0, 8)}…</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[hsl(var(--muted-foreground))]">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Prefix</th>
                <th className="py-2 pr-4">Last used</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-t border-[hsl(var(--border))]">
                  <td className="py-3 pr-4">{k.name}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{k.prefix}</td>
                  <td className="py-3 pr-4 text-xs text-[hsl(var(--muted-foreground))]">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    {k.revokedAt ? (
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">Revoked</span>
                    ) : (
                      <span className="text-xs">Active</span>
                    )}
                  </td>
                  <td className="py-3">
                    {!k.revokedAt ? (
                      <Button variant="destructive" onClick={() => revoke(k.id)} disabled={loading}>
                        Revoke
                      </Button>
                    ) : (
                      <Button variant="ghost" disabled>—</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-[hsl(var(--muted-foreground))]">
          Example:
          <pre className="mt-2 text-xs overflow-x-auto rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--secondary))]">
{`curl -X POST http://localhost:3000/api/events \\
  -H "content-type: application/json" \\
  -H "x-api-key: YOUR_KEY" \\
  -d '{ "sessionId":"sess_1", "type":"page_view", "path":"/pricing", "referrer":"google", "device":"desktop", "country":"KZ" }'`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}