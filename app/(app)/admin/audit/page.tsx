import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/server/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminAuditPage() {
  const me = await getCurrentUser();
  if (me.role !== "ADMIN") redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { email: true } } }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin • Audit logs</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Security/ops-grade trail.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Latest</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[hsl(var(--muted-foreground))]">
                <tr>
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">IP</th>
                  <th className="py-2">Meta</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-[hsl(var(--border))]">
                    <td className="py-3 pr-4 text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{l.user?.email}</td>
                    <td className="py-3 pr-4">{l.action}</td>
                    <td className="py-3 pr-4 text-xs">{l.ip ?? "—"}</td>
                    <td className="py-3 text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="font-mono">{l.meta ? JSON.stringify(l.meta) : "—"}</span>
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