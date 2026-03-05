import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { getCurrentUser } from "@/lib/server/session";
import { LogoutButton } from "@/components/logout-button";
import { Onboarding } from "@/components/onboarding";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const pathname = "/"; // active state isn't critical; kept simple

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            <span className="font-semibold text-foreground">{user.name ?? user.email}</span>{" "}
            <span className="ml-2 rounded-full border px-2 py-0.5 text-xs">{user.plan}</span>
            <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">{user.role}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 md:p-6 flex gap-6">
        <Sidebar pathname={pathname} isAdmin={user.role === "ADMIN"} />
        <div className="flex-1">
          <Onboarding />
          {children}
        </div>
      </main>
    </div>
  );
}