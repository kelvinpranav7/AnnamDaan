import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { donationService } from "@/services/donationService";
import { DonationCard } from "@/components/donations/DonationCard";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { motion } from "framer-motion";
import { Shield, UserCheck, Utensils, MapPin, Filter, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cleanDonorName } from "@/lib/utils";

export default function FoodFeed() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Fetch all live public donations
  const { data = [], isLoading } = useQuery({
    queryKey: ["donations", "public-feed"],
    queryFn: donationService.listPublic,
    refetchInterval: 3000,
  });

  async function handleAccept(id: string) {
    try {
      await donationService.updateStatus(id, "accepted");
      qc.invalidateQueries({ queryKey: ["donations"] });
      toast.success("Food rescue accepted! Arrange pickup soon.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to accept rescue.");
    }
  }

  // Determine filtering based on user role
  let filteredDonations = data;
  let feedTitle = "Food Rescues";
  let feedSubtitle = "View all live surplus food listings in the ecosystem.";
  let badgeIcon = <Utensils className="h-4 w-4" />;
  let badgeText = "All Listings";

  if (user) {
    if (user.role === "ngo") {
      // NGOs see only institutional food shared by donors (hotels, caterers, etc.)
      filteredDonations = data.filter((d: any) => d.source !== "community" && d.donorType !== "individual" && d.donorType !== "volunteer" && d.source !== "volunteer");
      feedTitle = "Institutional Food Rescues";
      feedSubtitle = "Verified food surpluses from premium donors, hotels, and caterers.";
      badgeIcon = <Shield className="h-4 w-4" />;
      badgeText = "Donor Surpluses Only";
    } else if (user.role === "volunteer") {
      // Volunteers see all community food
      filteredDonations = data.filter((d: any) => d.source === "community" || d.donorType === "individual" || d.donorType === "volunteer" || d.source === "volunteer");
      feedTitle = "Community Sharing Feed";
      feedSubtitle = "Surplus meals shared by volunteers and neighborhood residents.";
      badgeIcon = <UserCheck className="h-4 w-4" />;
      badgeText = "Volunteer Share Feed";
    } else if (user.role === "donor") {
      // Donors see institutional food
      filteredDonations = data.filter((d: any) => d.source !== "community" && d.donorType !== "individual" && d.donorType !== "volunteer" && d.source !== "volunteer");
      feedTitle = "Donor Sharing Hub";
      feedSubtitle = "View and manage institutional food surpluses.";
      badgeIcon = <Shield className="h-4 w-4" />;
      badgeText = "Institutional Listing Hub";
    }
  }

  // Get unique districts from filteredDonations
  const uniqueDistricts = Array.from(
    new Set(
      filteredDonations
        .map((d: any) => d.district?.trim())
        .filter(Boolean)
    )
  ).sort() as string[];

  // Filter options based on search query
  const matchingDistricts = uniqueDistricts.filter((district) =>
    district.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Filter listings by search query (matching district case-insensitively)
  const displayedDonations = filteredDonations.filter((d: any) => {
    if (!searchQuery.trim()) return true;
    return d.district?.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  return (
    <main className="max-w-container-max mx-auto px-gutter py-xl">
      {/* Premium Hero Section */}
      <section className="mb-xl text-left bg-gradient-to-r from-brand-50 to-brand-100/30 dark:from-brand-900/10 dark:to-transparent p-8 rounded-3xl border border-brand-100/50 dark:border-brand-900/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-neutral-900/80 px-3.5 py-1.5 rounded-full text-brand-700 dark:text-brand-300 font-medium text-xs border border-brand-200/50 mb-3.5 shadow-sm">
              {badgeIcon}
              <span>{badgeText}</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2 tracking-tight">
              {feedTitle}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              {feedSubtitle}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="bg-white/80 dark:bg-neutral-900/80 p-4 rounded-2xl border border-outline-variant/60 shadow-sm text-center min-w-[120px]">
              <span className="block font-display-md text-headline-lg text-primary">
                {displayedDonations.filter((d: any) => d.status === "live").length}
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filtration Section */}
      <section className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-outline-variant/60 shadow-sm relative">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Filter className="h-4 w-4 text-brand-500" />
          <span className="text-sm font-semibold tracking-wide uppercase">Filter by District</span>
        </div>
        
        {/* Custom Searchable Select Dropdown */}
        <div className="relative w-full sm:w-[280px]">
          <div className="relative flex items-center z-50">
            <MapPin className="absolute left-3 h-4.5 w-4.5 text-brand-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search or select district..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="pl-9 pr-8 bg-white dark:bg-neutral-900 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsOpen(false);
                }}
                className="absolute right-3 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground transition-colors"
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          
          {isOpen && (
            <>
              {/* Invisible Backdrop for click-outside to close */}
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
              
              <div className="absolute top-[calc(100%+8px)] left-0 w-full z-50 max-h-60 overflow-y-auto rounded-xl border border-outline-variant/60 bg-white dark:bg-neutral-900 dark:border-neutral-800 text-foreground shadow-glow p-1.5 space-y-0.5">
                {matchingDistricts.length === 0 ? (
                  <div className="py-3 px-3 text-xs text-muted-foreground italic text-center">
                    No matching districts
                  </div>
                ) : (
                  matchingDistricts.map((district) => (
                    <button
                      key={district}
                      type="button"
                      onClick={() => {
                        setSearchQuery(district);
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center rounded-lg py-2 px-3 text-sm text-left hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-700 dark:hover:text-brand-300 transition-colors text-on-surface"
                    >
                      {district}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Grid Content */}
      {isLoading ? (
        <div className="min-h-[40vh] grid place-items-center">
          <div className="flex flex-col items-center gap-3 text-on-surface-variant">
            <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm font-medium">Loading food feed...</span>
          </div>
        </div>
      ) : displayedDonations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-dashed border-outline bg-surface-container-lowest p-16 text-center text-on-surface-variant shadow-soft"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-primary mb-4">
            <Utensils className="h-7 w-7" />
          </div>
          <h3 className="font-headline-md text-headline-md font-bold mb-1 text-on-surface">No food items found</h3>
          <p className="max-w-md mx-auto text-sm text-on-surface-variant">
            {searchQuery.trim() !== ""
              ? `There are currently no active surplus food listings in or matching "${searchQuery}". Try searching another district.`
              : "There are currently no active surplus food listings matching your criteria. Check back soon!"}
          </p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {displayedDonations.map((d: any) => (
            <DonationCard
              key={d.id}
              donation={d}
              onAccept={
                d.status === "live" && (
                  (user?.role === "ngo" && d.source !== "community") ||
                  (user?.role === "volunteer" && d.source === "community" && d.donorId !== user?.uid)
                ) ? () => handleAccept(d.id) : undefined
              }
              onView={() => setSelectedDonation(d)}
              quantityLabel="Quantity"
              quantitySuffix="people"
            />
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      {selectedDonation && (
        <Dialog open={!!selectedDonation} onOpenChange={(open) => !open && setSelectedDonation(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold text-on-surface">
                {selectedDonation.foodType}
              </DialogTitle>
              <DialogDescription className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-1">
                <span className="bg-primary-fixed text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {selectedDonation.status === "accepted" ? "Claimed" : selectedDonation.status}
                </span>
                <span>· Posted by {cleanDonorName(selectedDonation.donorName)}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {selectedDonation.images && selectedDonation.images[0] && (
                <div className="h-56 rounded-2xl overflow-hidden border border-outline-variant bg-surface-container">
                  <img
                    src={selectedDonation.images[0]}
                    alt={selectedDonation.foodType}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Meals Count</span>
                  <p className="text-sm font-semibold mt-0.5">{selectedDonation.quantityMeals} meals</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-xl border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Shared At</span>
                  <p className="text-sm font-semibold mt-0.5">{new Date(selectedDonation.preparedAt).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-xl border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pickup By</span>
                  <p className="text-sm font-semibold mt-0.5">{new Date(selectedDonation.pickupBy).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Location</span>
                <p className="text-sm mt-0.5 font-medium">{selectedDonation.location?.address || "—"}</p>
              </div>

              {selectedDonation.notes && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Notes</span>
                  <p className="text-sm mt-0.5 text-on-surface-variant bg-surface p-3 rounded-xl border italic leading-relaxed">
                    "{selectedDonation.notes}"
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
