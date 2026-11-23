import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { donationService } from "@/services/donationService";
import { formatDistanceToNow } from "date-fns";

export default function PublicFeed() {
  const { data: live = [], isLoading } = useQuery({
    queryKey: ["donations", "public"],
    queryFn: () => donationService.listPublic(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Impact feed
        </h2>
        <p className="text-sm text-muted-foreground">
          Live donations being rescued across the platform.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : live.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 shadow-card text-center">
              <div className="font-semibold">No live donations right now</div>
              <div className="text-sm text-muted-foreground mt-1">
                When donors list surplus food, you'll see it here in real time.
              </div>
            </div>
          ) : (
            live.map((d, i) => (
              <motion.article
                key={d.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border bg-white shadow-card overflow-hidden"
              >
                <div className="p-5 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{d.donorName}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.donorType} ·{" "}
                      {formatDistanceToNow(new Date(d.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <Badge variant="default">
                    <Sparkles className="h-3 w-3" /> Live
                  </Badge>
                </div>
                <div className="px-5 pb-4 text-foreground/90 leading-relaxed text-sm">
                  {d.foodType} · {d.quantityMeals} meals available for pickup.
                </div>
                {d.images?.[0] && (
                  <img
                    src={d.images[0]}
                    alt=""
                    className="w-full max-h-96 object-cover"
                  />
                )}
                <div className="grid grid-cols-2 border-t">
                  <Stat label="Meals" value={d.quantityMeals} />
                  <Stat
                    label="Pickup by"
                    text={new Date(d.pickupBy).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                </div>
              </motion.article>
            ))
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-brand-gradient text-white p-5 shadow-soft">
            <div className="text-xs uppercase tracking-wider opacity-80">
              Help feed more
            </div>
            <div className="font-display text-xl font-bold mt-1">
              Every donation counts
            </div>
            <p className="mt-1 text-sm text-white/85">
              Sign up as a donor, NGO, or volunteer to take part.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-card">
            <div className="font-medium text-sm mb-3">Live count</div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-brand-700" />
              {live.length} donation{live.length === 1 ? "" : "s"} active right now
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  text,
}: {
  label: string;
  value?: number;
  text?: string;
}) {
  return (
    <div className="text-center py-3">
      <div className="font-display font-semibold text-lg">
        {text ?? value ?? 0}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
