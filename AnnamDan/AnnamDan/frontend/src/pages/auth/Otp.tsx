import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Otp() {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const nav = useNavigate();

  function setDigit(i: number, v: string) {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  }

  return (
    <AuthShell>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Sign in with OTP
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll send a 6-digit code to your phone.
        </p>

        {!sent ? (
          <div className="mt-8 space-y-4">
            <div>
              <Label>Phone number</Label>
              <Input
                className="mt-1.5"
                placeholder="+91 98xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={phone.length < 10}
              onClick={() => {
                setSent(true);
                toast.success("OTP sent to " + phone);
              }}
            >
              Send OTP
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <Label>Enter the 6-digit code</Label>
            <div className="flex gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  inputMode="numeric"
                  maxLength={1}
                  className="h-14 w-12 rounded-xl border border-input bg-white text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              ))}
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={digits.some((d) => !d)}
              onClick={() => {
                toast.success("Verified");
                nav("/app/donor");
              }}
            >
              Verify & continue
            </Button>
            <button
              onClick={() => setSent(false)}
              className="w-full text-sm text-brand-700 hover:underline"
            >
              Change number
            </button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
