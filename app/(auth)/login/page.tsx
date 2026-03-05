import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./ui";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">Welcome back to projecttt</div>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
          No account? <a className="underline" href="/register">Create one</a>
        </div>
      </CardContent>
    </Card>
  );
}
