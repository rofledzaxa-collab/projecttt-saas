import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "./ui";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">Start tracking events and conversions</div>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <div className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
          Already have an account? <a className="underline" href="/login">Sign in</a>
        </div>
      </CardContent>
    </Card>
  );
}
