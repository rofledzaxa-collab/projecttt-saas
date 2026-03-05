import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "projecttt — SaaS Analytics",
  description: "Premium SaaS analytics dashboard with AI scoring."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
