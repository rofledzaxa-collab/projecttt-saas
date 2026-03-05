import Link from "next/link";
import React from "react";
import { LayoutDashboard, BarChart3, Users, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const NavItem = ({
  href,
  icon,
  label,
  active
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-[hsl(var(--secondary))]",
      active && "bg-[hsl(var(--secondary))]"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export function Sidebar({ pathname, isAdmin }: { pathname: string; isAdmin: boolean }) {
  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="mb-4">
          <div className="text-lg font-semibold">projecttt</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Analytics • AI Scoring</div>
        </div>

        <nav className="space-y-1">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={16} />}
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
          <NavItem
            href="/analytics"
            icon={<BarChart3 size={16} />}
            label="Analytics"
            active={pathname === "/analytics"}
          />
          <NavItem
            href="/segments"
            icon={<Shield size={16} />}
            label="Segments"
            active={pathname === "/segments"}
          />
          <NavItem
            href="/settings"
            icon={<Settings size={16} />}
            label="Settings"
            active={pathname === "/settings"}
          />

          {isAdmin && (
            <>
              <div className="pt-2" />
              <NavItem
                href="/admin/users"
                icon={<Users size={16} />}
                label="Admin: Users"
                active={pathname.startsWith("/admin/users")}
              />
              <NavItem
                href="/admin/audit"
                icon={<Shield size={16} />}
                label="Admin: Audit"
                active={pathname.startsWith("/admin/audit")}
              />
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}