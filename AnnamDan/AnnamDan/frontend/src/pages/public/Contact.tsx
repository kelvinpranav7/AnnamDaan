import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 grid md:grid-cols-2 gap-12">
      <div>
        <Badge variant="default" className="mb-4">
          Contact
        </Badge>
        <h1 className="font-display text-5xl font-bold tracking-tight">
          Let's <span className="text-gradient">talk.</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
          For partnerships, press, or just to share a kind word — we listen
          carefully and reply within 24 hours.
        </p>
        <div className="mt-8 space-y-4">
          {[
            { icon: Mail, label: "hello@annamdaan.org" },
            { icon: Phone, label: "+91 80 1234 5678" },
            { icon: MapPin, label: "Bengaluru · Hyderabad · Chennai" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 grid place-items-center text-brand-700">
                <c.icon className="h-4 w-4" />
              </div>
              <div className="text-sm">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Message sent — we'll be in touch shortly.");
          (e.target as HTMLFormElement).reset();
        }}
        className="rounded-2xl border bg-white p-6 shadow-card space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>First name</Label>
            <Input className="mt-1.5" required placeholder="Aisha" />
          </div>
          <div>
            <Label>Last name</Label>
            <Input className="mt-1.5" required placeholder="Verma" />
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <Input className="mt-1.5" required type="email" placeholder="you@org.com" />
        </div>
        <div>
          <Label>Organization</Label>
          <Input className="mt-1.5" placeholder="Hotel / NGO / Trust" />
        </div>
        <div>
          <Label>Message</Label>
          <Textarea
            className="mt-1.5"
            required
            placeholder="Tell us how we can help…"
          />
        </div>
        <Button type="submit" size="lg" className="w-full">
          Send message
        </Button>
      </form>
    </div>
  );
}
