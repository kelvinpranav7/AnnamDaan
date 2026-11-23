import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Need {
  id: string;
  title: string;
  qty: string;
  note: string;
  urgency: "low" | "medium" | "high";
}

export default function Needs() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [draft, setDraft] = useState<Omit<Need, "id">>({
    title: "",
    qty: "",
    note: "",
    urgency: "medium",
  });

  function add() {
    if (!draft.title) return;
    setNeeds((n) => [{ ...draft, id: Math.random().toString(36).slice(2) }, ...n]);
    setDraft({ title: "", qty: "", note: "", urgency: "medium" });
    toast.success("Need published — donors and public users notified");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Publish needs
        </h2>
        <p className="text-sm text-muted-foreground">
          Tell donors and the public exactly what your community needs today.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
        <div className="rounded-2xl border bg-white p-6 shadow-card">
          <div className="text-sm font-medium mb-3">Active needs</div>
          <AnimatePresence>
            <div className="space-y-3">
              {needs.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6">
                  No active needs. Publish one to get started.
                </div>
              )}
              {needs.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  className="rounded-xl border p-4 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-brand-50 grid place-items-center text-brand-700">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {n.qty} · {n.note}
                    </div>
                  </div>
                  <Badge
                    variant={
                      n.urgency === "high"
                        ? "danger"
                        : n.urgency === "medium"
                        ? "warning"
                        : "muted"
                    }
                  >
                    {n.urgency}
                  </Badge>
                  <button
                    onClick={() =>
                      setNeeds((all) => all.filter((x) => x.id !== n.id))
                    }
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-card">
          <div className="text-sm font-medium mb-3">Add a new need</div>
          <div className="space-y-3">
            <div>
              <Label>What do you need?</Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Hot meals for shelter"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. 120 meals"
                value={draft.qty}
                onChange={(e) => setDraft({ ...draft, qty: e.target.value })}
              />
            </div>
            <div>
              <Label>Note</Label>
              <Textarea
                className="mt-1.5"
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
            </div>
            <div>
              <Label>Urgency</Label>
              <div className="mt-1.5 flex gap-2">
                {(["low", "medium", "high"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setDraft({ ...draft, urgency: u })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      draft.urgency === u
                        ? "bg-brand-gradient text-white border-transparent"
                        : "bg-white hover:bg-secondary"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={add} className="w-full" size="lg">
              <Plus className="h-4 w-4" /> Publish need
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
