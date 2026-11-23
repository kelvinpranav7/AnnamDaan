import type { Response } from "express";
import { z } from "zod";
import { rankNgos } from "../services/matchingService.js";
import type { AuthRequest } from "../middleware/auth.js";

const schema = z.object({
  donation: z.object({
    id: z.string(),
    location: z.object({ lat: z.number(), lng: z.number() }),
    quantityMeals: z.number().int().positive(),
    pickupBy: z.string(),
  }),
  ngos: z.array(
    z.object({
      id: z.string(),
      location: z.object({ lat: z.number(), lng: z.number() }),
      capacityMeals: z.number(),
      rating: z.number(),
      reliability: z.number(),
    })
  ),
});

export async function match(req: AuthRequest, res: Response) {
  const { donation, ngos } = schema.parse(req.body);
  const ranked = rankNgos(donation, ngos).slice(0, 5);
  res.json({ matches: ranked });
}
