import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Forgot() {
  const [email, setEmail] = useState("");
  return (
    <AuthShell>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll send a secure reset link to your email.
        </p>
        <div className="mt-8 space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              className="mt-1.5"
              type="email"
              placeholder="you@org.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={!email.includes("@")}
            onClick={() => toast.success("Reset link sent to " + email)}
          >
            Send reset link
          </Button>
          <Link
            to="/login"
            className="block text-center text-sm text-brand-700 hover:underline"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
