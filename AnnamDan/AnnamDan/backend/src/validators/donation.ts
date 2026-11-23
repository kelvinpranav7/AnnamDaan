import { z } from "zod";

export const createDonationSchema = z.object({
  foodType: z.string().min(2),
  donorType: z.enum(["hotel", "wedding", "caterer", "individual"]).optional(),
  /** institutional = large donor (hotel/caterer), community = volunteer's small donation */
  source: z.enum(["institutional", "community"]).optional(),
  quantityMeals: z.number().int().positive(),
  preparedAt: z.string(),
  pickupBy: z.string(),
  notes: z.string().optional(),
  images: z.array(z.string().url()).min(1),
  district: z.string().trim().min(2, "District is required"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "Pincode must be 4–8 digits"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
});

export const updateStatusSchema = z.object({
  status: z.enum(["live", "accepted", "picked_up", "expired"]),
});
