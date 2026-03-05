import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const styles: Record<string, string> = {
    default: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 focus:ring-[hsl(var(--ring))]",
    secondary: "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:opacity-90 focus:ring-[hsl(var(--ring))]",
    ghost: "bg-transparent hover:bg-[hsl(var(--secondary))] focus:ring-[hsl(var(--ring))]",
    destructive: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:opacity-90 focus:ring-[hsl(var(--ring))]"
  };
  return <button className={cn(base, styles[variant], className)} {...props} />;
}
