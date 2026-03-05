import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const me = await getCurrentUser();
  if (me.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin • Users</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">RBAC-protected admin console.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Users</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[hsl(var(--muted-foreground))]">
                <tr>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-[hsl(var(--border))]">
                    <td className="py-3 pr-4 font-mono text-xs">{u.email}</td>
                    <td className="py-3 pr-4">{u.name ?? "-"}</td>
                    <td className="py-3 pr-4">{u.role}</td>
                    <td className="py-3 pr-4">{u.plan}</td>
                    <td className="py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
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
