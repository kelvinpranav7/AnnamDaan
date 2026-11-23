import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Sparkles,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { donationService } from "@/services/donationService";
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete";
import { GeoMap } from "@/components/maps/GeoMap";
import { uploadService } from "@/services/uploadService";
import { aiService, type FoodSafety } from "@/services/aiService";
import { useAuthStore } from "@/store/authStore";
import { useRef } from "react";

const schema = z.object({
  foodType: z.string().min(2),
  quantityMeals: z.coerce.number().int().positive(),
  preparedAt: z.string(),
  pickupBy: z.string(),
  notes: z.string().optional(),
  district: z.string().trim().min(2, "District required"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "Enter a valid pincode"),
});
type Form = z.infer<typeof schema>;

export default function NewDonation() {
  const nav = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const qc = useQueryClient();

  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addressText, setAddressText] = useState("");
  const [picked, setPicked] = useState<{
    lat: number;
    lng: number;
    formatted: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB");
      return;
    }
    try {
      const { url } = await uploadService.image(file);
      setImage(url);
      toast.success("Photo uploaded");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }



  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      foodType: "Veg Biryani · Raita · Salad",
      quantityMeals: 60,
      preparedAt: new Date().toISOString().slice(0, 16),
      pickupBy: new Date(Date.now() + 90 * 60_000).toISOString().slice(0, 16),
      district: authUser?.district ?? "",
      pincode: authUser?.pincode ?? "",
    },
  });

  useEffect(() => {
    if (!editId) return;
    async function load() {
      try {
        const donation = await donationService.get(editId!);
        reset({
          foodType: donation.foodType,
          quantityMeals: donation.quantityMeals,
          preparedAt: new Date(donation.preparedAt).toISOString().slice(0, 16),
          pickupBy: new Date(donation.pickupBy).toISOString().slice(0, 16),
          district: donation.district,
          pincode: donation.pincode,
          notes: donation.notes || "",
        });
        setImage(donation.images?.[0] || null);
        if (donation.location) {
          setPicked({
            lat: donation.location.lat,
            lng: donation.location.lng,
            formatted: donation.location.address || "",
          });
          setAddressText(donation.location.address || "");
        }

      } catch (err: any) {
        toast.error("Failed to load donation details");
      }
    }
    load();
  }, [editId, reset]);

  async function onSubmit(d: Form) {
    if (!picked) {
      toast.error("Please select a pickup address");
      return;
    }
    if (!image) {
      toast.error("Please upload a food photo first");
      return;
    }
    try {
      const payload = {
        foodType: d.foodType,
        quantityMeals: d.quantityMeals,
        pickupBy: d.pickupBy,
        notes: d.notes || "",
        images: [image],
        district: d.district,
        pincode: d.pincode,
        location: {
          lat: picked.lat,
          lng: picked.lng,
          address: picked.formatted,
        },
      };

      if (editId) {
        await donationService.update(editId, payload as any);
        qc.invalidateQueries({ queryKey: ["donations"] });
        qc.invalidateQueries({ queryKey: ["stats"] });
        toast.success("Donation updated successfully");
      } else {
        await donationService.create({
          ...payload,
          donorType: "hotel",
          preparedAt: d.preparedAt,
        } as any);
        qc.invalidateQueries({ queryKey: ["donations"] });
        qc.invalidateQueries({ queryKey: ["stats"] });
        toast.success("Donation listed · matching nearby NGOs…");
      }
      nav("/app/donor/tracking");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save donation");
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {editId ? "Edit surplus food" : "List surplus food"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Takes ~60 seconds. AI verifies safety before NGOs are notified.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-2xl border bg-white p-6 shadow-card space-y-5">
          <div>
            <Label>Food type</Label>
            <Input className="mt-1.5" {...register("foodType")} />
            {errors.foodType && (
              <p className="text-xs text-destructive mt-1">Required</p>
            )}
          </div>

          <div>
            <Label>Quantity (people)</Label>
            <Input
              className="mt-1.5"
              type="number"
              {...register("quantityMeals")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Shared at</Label>
              <Input
                type="datetime-local"
                className="mt-1.5"
                {...register("preparedAt")}
              />
            </div>
            <div>
              <Label>Pick up by</Label>
              <Input
                type="datetime-local"
                className="mt-1.5"
                {...register("pickupBy")}
              />
            </div>
          </div>

          <div>
            <Label>Instructions</Label>
            <Textarea
              className="mt-1.5"
              placeholder="Pickup gate, contact person, container info…"
              {...register("notes")}
            />
          </div>

          <div>
            <Label>Pickup location</Label>
            <AddressAutocomplete
              value={addressText}
              onChange={setAddressText}
              onSelect={(p: any) => {
                setPicked({ lat: p.lat, lng: p.lon, formatted: p.formatted });
                // Auto-fill district + pincode from the Geoapify result.
                const inferredDistrict =
                  p.county || p.city || p.state || "";
                const inferredPin =
                  p.postcode || p.pincode || "";
                if (inferredDistrict) {
                  setValue("district", String(inferredDistrict), {
                    shouldValidate: true,
                  });
                }
                if (inferredPin && /^\d{4,8}$/.test(String(inferredPin))) {
                  setValue("pincode", String(inferredPin), {
                    shouldValidate: true,
                  });
                }
              }}
              placeholder="Type a hotel, street or landmark…"
              className="mt-1.5"
            />
            {picked && (
              <div className="mt-3 rounded-xl border border-outline-variant overflow-hidden">
                <GeoMap
                  height="200px"
                  zoom={15}
                  markers={[
                    {
                      id: "pickup",
                      lat: picked.lat,
                      lng: picked.lng,
                      title: "Pickup location",
                      subtitle: picked.formatted,
                    },
                  ]}
                />
                <div className="p-3 bg-surface-container-low text-label-sm text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    location_on
                  </span>
                  <span className="font-bold">
                    {picked.lat.toFixed(4)}°, {picked.lng.toFixed(4)}°
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* District + Pincode — drives the NGO matching */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                placeholder="Chennai"
                className="mt-1.5"
                {...register("district")}
              />
              {errors.district && (
                <p className="text-error text-xs mt-1">
                  {errors.district.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                inputMode="numeric"
                placeholder="600001"
                className="mt-1.5"
                {...register("pincode")}
              />
              {errors.pincode && (
                <p className="text-error text-xs mt-1">
                  {errors.pincode.message}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-on-surface-variant">
            Only NGOs in this district/pincode will see this donation.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => nav(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !image || !picked}
            >
              {isSubmitting ? (editId ? "Saving…" : "Donating…") : (editId ? "Save changes" : "Donate")}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <Label>Food photo</Label>
              <Badge variant="muted">Required</Badge>
            </div>
            <label
              htmlFor="food-photo"
              className="mt-3 aspect-[4/3] rounded-xl border-2 border-dashed border-border bg-secondary/40 grid place-items-center overflow-hidden relative cursor-pointer hover:border-primary transition-colors"
            >
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <Camera className="h-6 w-6 mx-auto mb-1" />
                  {uploading ? "Uploading…" : "Tap to upload"}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 grid place-items-center text-white text-sm">
                  Uploading…
                </div>
              )}
            </label>
            <input
              ref={fileInputRef}
              id="food-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              className="sr-only"
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full mt-3"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? "Re-take / upload" : "Choose a photo"}
            </Button>
          </div>



          <div className="rounded-2xl border bg-brand-gradient text-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">You're FSSAI verified</span>
            </div>
            <p className="mt-2 text-xs text-white/85 leading-relaxed">
              Your license was validated via OCR. NGOs will see a verified
              badge on this donation.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}


