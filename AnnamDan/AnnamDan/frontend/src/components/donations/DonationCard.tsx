import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Utensils, Sparkles, Trash2 } from "lucide-react";
import type { Donation } from "@/types";
import { formatRelative, cleanDonorName } from "@/lib/utils";

const STATUS: Record<Donation["status"], { label: string; tone: any }> = {
  live: { label: "Live", tone: "success" },
  accepted: { label: "Claimed", tone: "default" },
  picked_up: { label: "Picked up", tone: "muted" },
  expired: { label: "Expired", tone: "danger" },
};

export function DonationCard({
  donation,
  onAccept,
  onView,
  onEdit,
  onDelete,
  quantityLabel = "Meals",
  quantitySuffix = "meals",
}: {
  donation: Donation;
  onAccept?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  quantityLabel?: string;
  quantitySuffix?: string;
}) {
  const s = STATUS[donation.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border bg-white shadow-card overflow-hidden group"
    >
      <div className="relative h-40 bg-secondary overflow-hidden">
        {donation.images[0] && (
          <img
            src={donation.images[0]}
            alt={donation.foodType}
            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
          />
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={s.tone as any}>{s.label}</Badge>
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-white text-[10px] uppercase tracking-wider">
          ID {donation.id}
        </div>
      </div>
      <div className="p-5">
        <div className="text-xs text-muted-foreground">
          {cleanDonorName(donation.donorName)}
        </div>
        <div className="font-semibold text-base mt-0.5 line-clamp-1">
          {donation.foodType}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <Cell icon={Utensils} label={quantityLabel} value={`${donation.quantityMeals} ${quantitySuffix}`} />
          <Cell icon={Clock} label="Shared" value={formatRelative(donation.preparedAt)} />
          <Cell icon={MapPin} label="Area" value={donation.location.address?.split(",")[0] || "—"} />
        </div>
        {(onAccept || onView || onEdit || onDelete || donation.status === "accepted") && (
          <div className="mt-4 flex gap-2">
            {onView && (
              <Button onClick={onView} variant="secondary" className="flex-1">
                Details
              </Button>
            )}
            {onAccept && donation.status === "live" && (
              <Button onClick={onAccept} className="flex-1">
                Accept pickup
              </Button>
            )}
            {donation.status === "accepted" && (
              <Button
                disabled
                className="flex-1 bg-red-100 border border-red-200 text-black disabled:opacity-100 cursor-not-allowed font-medium flex items-center justify-center gap-1 shadow-inner"
              >
                <span className="material-symbols-outlined text-[16px] text-red-600 font-bold">
                  check_circle
                </span>
                Claimed
              </Button>
            )}
            {onEdit && (
              <Button onClick={onEdit} variant="outline" className="flex-1">
                Edit
              </Button>
            )}
            {onDelete && donation.status !== "picked_up" && (
              <Button
                onClick={onDelete}
                variant="secondary"
                className="text-error hover:bg-error-container"
                title="Delete donation"
                aria-label="Delete donation"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Cell({ icon: I, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-secondary/50 p-2.5">
      <div className="flex items-center gap-1 text-muted-foreground">
        <I className="h-3 w-3" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-medium text-sm mt-0.5 line-clamp-1">{value}</div>
    </div>
  );
}
