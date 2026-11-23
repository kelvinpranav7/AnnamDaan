import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { donationService } from "@/services/donationService";
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete";
import { GeoMap } from "@/components/maps/GeoMap";
import { uploadService } from "@/services/uploadService";
import { aiService, type FoodSafety } from "@/services/aiService";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  foodType: z.string().min(2, "Required"),
  quantityMeals: z.coerce.number().int().positive("Must be at least 1"),
  pickupBy: z.string(),
  notes: z.string().optional(),
  district: z.string().trim().min(2, "District required"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "Enter a valid pincode"),
});
type Form = z.infer<typeof schema>;

export default function VolunteerNewDonation() {
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
      toast.error(err?.response?.data?.error || "Upload failed");
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
      foodType: "",
      quantityMeals: 2,
      pickupBy: new Date(Date.now() + 4 * 60 * 60_000).toISOString().slice(0, 16),
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
      toast.error("Please select your pickup address");
      return;
    }
    if (!image) {
      toast.error("Please add a photo of the food");
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
          donorType: "individual",
          source: "community",
          preparedAt: new Date().toISOString(),
        } as any);
        qc.invalidateQueries({ queryKey: ["donations"] });
        qc.invalidateQueries({ queryKey: ["stats"] });
        toast.success("Donation shared · NGOs and neighbors notified");
      }
      nav("/app/volunteer");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save donation");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-gutter py-lg">
      <div className="mb-lg">
        <h1 className="font-display-lg text-display-lg text-primary mb-xs">
          {editId ? "Edit Shared Food" : "Share Food"}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Got extra food at home? List it in under a minute. An NGO or someone
          nearby will pick it up.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-outline-variant impact-card-shadow p-lg space-y-md"
      >
        {/* Photo */}
        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">
            Food photo
          </label>
          <label
            htmlFor="vol-food-photo"
            className="aspect-[4/3] rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low grid place-items-center overflow-hidden relative cursor-pointer hover:border-primary transition-colors"
          >
            {image ? (
              <img
                src={image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] opacity-50">
                  photo_camera
                </span>
                <p className="font-body-md text-body-md mt-xs">
                  {uploading
                    ? "Uploading…"
                    : "Add a photo so people know what you're sharing"}
                </p>
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
            id="vol-food-photo"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="sr-only"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-sm w-full border border-outline-variant text-on-surface-variant py-sm rounded-xl font-label-sm text-label-sm hover:bg-surface-container-low transition-colors disabled:opacity-60"
          >
            {image ? "Replace photo" : "Choose a photo"}
          </button>


        </div>

        {/* What */}
        <div>
          <label
            className="font-label-sm text-label-sm text-on-surface-variant block mb-xs"
            htmlFor="foodType"
          >
            What are you sharing?
          </label>
          <input
            id="foodType"
            type="text"
            placeholder="e.g. Rice & dal, sandwiches, fruit basket"
            className="w-full px-md py-md bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none"
            {...register("foodType")}
          />
          {errors.foodType && (
            <p className="text-error font-label-sm text-label-sm mt-1">
              {errors.foodType.message}
            </p>
          )}
        </div>

        {/* Quantity + Pickup-by */}
        <div className="grid grid-cols-2 gap-md">
          <div>
            <label
              className="font-label-sm text-label-sm text-on-surface-variant block mb-xs"
              htmlFor="quantityMeals"
            >
              How many people can it feed?
            </label>
            <input
              id="quantityMeals"
              type="number"
              min="1"
              className="w-full px-md py-md bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none"
              {...register("quantityMeals")}
            />
            {errors.quantityMeals && (
              <p className="text-error font-label-sm text-label-sm mt-1">
                {errors.quantityMeals.message}
              </p>
            )}
          </div>
          <div>
            <label
              className="font-label-sm text-label-sm text-on-surface-variant block mb-xs"
              htmlFor="pickupBy"
            >
              Pick up by
            </label>
            <input
              id="pickupBy"
              type="datetime-local"
              className="w-full px-md py-md bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none"
              {...register("pickupBy")}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            className="font-label-sm text-label-sm text-on-surface-variant block mb-xs"
            htmlFor="notes"
          >
            Any notes? (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="e.g. Doorstep pickup, ring the bell, allergens…"
            className="w-full px-md py-md bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none resize-none"
            {...register("notes")}
          />
        </div>

        {/* Address */}
        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">
            Your pickup address
          </label>
          <AddressAutocomplete
            value={addressText}
            onChange={setAddressText}
            onSelect={(p: any) => {
              setPicked({ lat: p.lat, lng: p.lon, formatted: p.formatted });
              const inferredDistrict = p.county || p.city || p.state || "";
              const inferredPin = p.postcode || "";
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
            placeholder="Start typing your home or street…"
          />
          {picked && (
            <div className="mt-sm rounded-xl border border-outline-variant overflow-hidden">
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
            </div>
          )}
        </div>

        {/* District + Pincode — drives NGO matching */}
        <div className="grid grid-cols-2 gap-md">
          <div>
            <label
              className="font-label-sm text-label-sm text-on-surface-variant block mb-xs"
              htmlFor="vol-district"
            >
              District
            </label>
            <input
              id="vol-district"
              type="text"
              placeholder="Chennai"
              className="w-full px-md py-md bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none"
              {...register("district")}
            />
            {errors.district && (
              <p className="text-error font-label-sm text-label-sm mt-1">
                {errors.district.message}
              </p>
            )}
          </div>
          <div>
            <label
              className="font-label-sm text-label-sm text-on-surface-variant block mb-xs"
              htmlFor="vol-pincode"
            >
              Pincode
            </label>
            <input
              id="vol-pincode"
              type="text"
              inputMode="numeric"
              placeholder="600001"
              className="w-full px-md py-md bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none"
              {...register("pincode")}
            />
            {errors.pincode && (
              <p className="text-error font-label-sm text-label-sm mt-1">
                {errors.pincode.message}
              </p>
            )}
          </div>
        </div>
        <p className="text-label-sm text-on-surface-variant -mt-sm">
          Only NGOs in this district/pincode will see your donation.
        </p>

        {/* Actions */}
        <div className="flex gap-md pt-md border-t border-outline-variant">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="flex-1 border border-outline-variant text-on-surface-variant py-md rounded-2xl font-label-sm text-label-sm hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] bg-primary text-on-primary py-md rounded-2xl font-headline-md text-headline-md hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {isSubmitting ? (editId ? "Saving…" : "Sharing…") : (editId ? "Save Changes" : "Share Food")}
          </button>
        </div>
      </form>
    </main>
  );
}
