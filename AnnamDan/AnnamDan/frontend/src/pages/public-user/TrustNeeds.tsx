import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ngoService } from "@/services/ngoService";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TrustNeeds() {
  const { data, isLoading } = useQuery({
    queryKey: ["ngos"],
    queryFn: () => ngoService.list(),
  });

  const ngos = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Trust needs near you
        </h2>
        <p className="text-sm text-muted-foreground">
          Contribute items, time, or money to the causes that need it most.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : ngos.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 shadow-card text-center">
          <div className="font-semibold">No verified NGOs yet</div>
          <div className="text-sm text-muted-foreground mt-1">
            Verified partners will appear here as they join the platform.
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ngos.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border bg-white p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <Badge variant={n.verified ? "success" : "muted"}>
                  <Sparkles className="h-3 w-3" />{" "}
                  {n.verified ? "Verified" : "Pending"}
                </Badge>
                {typeof n.rating === "number" && (
                  <div className="text-xs text-muted-foreground">★ {n.rating}</div>
                )}
              </div>
              <div className="mt-3 font-semibold">{n.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {n.reach ?? 0} km reach ·{" "}
                {n.capacityMeals ?? 0} meals/day
              </div>
              {n.needs && n.needs.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {n.needs.map((nd) => (
                    <li
                      key={nd}
                      className="text-[10px] px-2 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100"
                    >
                      {nd}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => toast.success("Contribution started")}
                >
                  <Heart className="h-4 w-4" /> Contribute
                </Button>
                <Button variant="secondary">Details</Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
