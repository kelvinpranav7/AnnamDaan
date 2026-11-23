import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

type PendingItem = {
  id: string;
  name: string;
  type: string;
  fssai: string;
  ocrConfidence: number;
  submitted: string;
};

const PENDING: PendingItem[] = [];

export default function Verifications() {
  const [items, setItems] = useState(PENDING);

  function act(id: string, ok: boolean) {
    setItems((all) => all.filter((i) => i.id !== id));
    toast.success(ok ? "Verified" : "Rejected");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Verifications
        </h2>
        <p className="text-sm text-muted-foreground">
          AI-assisted review of FSSAI and NGO documents.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending · {items.length}</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border bg-white p-5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{v.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {v.type} · submitted {v.submitted}
                    </div>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <div className="mt-4 rounded-xl border bg-secondary/40 p-3 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-brand-700" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">License document</div>
                    <div className="text-xs text-muted-foreground">
                      FSSAI · {v.fssai || "Not detected"}
                    </div>
                  </div>
                  {v.ocrConfidence > 0 && (
                    <Badge
                      variant={
                        v.ocrConfidence >= 0.85
                          ? "success"
                          : v.ocrConfidence >= 0.7
                          ? "warning"
                          : "danger"
                      }
                    >
                      <Sparkles className="h-3 w-3" /> OCR{" "}
                      {Math.round(v.ocrConfidence * 100)}%
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => act(v.id, false)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                  <Button onClick={() => act(v.id, true)} className="flex-1">
                    <CheckCircle2 className="h-4 w-4" /> Verify
                  </Button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-full rounded-2xl border bg-white p-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                You're all caught up.
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="verified">
          <div className="rounded-2xl border bg-white p-12 text-center text-muted-foreground">
            No verified organizations yet.
          </div>
        </TabsContent>
        <TabsContent value="rejected">
          <div className="rounded-2xl border bg-white p-12 text-center text-muted-foreground">
            No rejected organizations yet.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
