import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/server/session";
import { PlanSwitcher } from "./ui";
import { ApiKeysPanel } from "./api-keys";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const host = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Billing is mocked. API keys are real (stored hashed).
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Plan</CardTitle></CardHeader>
        <CardContent>
          <PlanSwitcher currentPlan={user.plan} />
        </CardContent>
      </Card>

      <ApiKeysPanel />

      <Card>
        <CardHeader>
          <CardTitle>Install snippet</CardTitle>
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            Paste this on any website to auto-track page_view, clicks, form submits.
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
            1) Create an API key above  2) Insert key into snippet:
          </div>
          <pre className="text-xs overflow-x-auto rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--secondary))]">
{`<!-- projecttt tracker -->
<script src="${host}/api/sdk?key=YOUR_KEY&host=${host}"></script>`}
          </pre>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
            Tip: for production you would use your deployed URL instead of localhost.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}