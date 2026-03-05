"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const form = new FormData(e.target as HTMLFormElement);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    setLoading(false);
    if (!r.ok) {
      const t = await r.text();
      setErr(t || "Login failed");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-sm">Email</label>
        <Input name="email" type="email" placeholder="you@domain.com" required />
      </div>
      <div>
        <label className="text-sm">Password</label>
        <Input name="password" type="password" placeholder="••••••••" required />
      </div>
      {err && <div className="text-sm text-red-500">{err}</div>}
      <Button className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
      <div className="text-xs text-[hsl(var(--muted-foreground))]">
        Demo: <span className="font-mono">demo@projecttt.dev / Demo123!</span>
      </div>
    </form>
  );
}
