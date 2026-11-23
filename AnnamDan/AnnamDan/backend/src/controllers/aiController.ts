import type { Response } from "express";
import { z } from "zod";
import { ai } from "../services/aiClient.js";
import { env } from "../config/env.js";
import type { AuthRequest } from "../middleware/auth.js";

const schema = z.object({
  imageUrl: z.string().refine(
    (v) =>
      v.startsWith("http://") ||
      v.startsWith("https://") ||
      v.startsWith("data:image/"),
    { message: "imageUrl must be an http(s) URL or a data:image URL" }
  ),
});

export async function ocrFssai(req: AuthRequest, res: Response) {
  const { imageUrl } = schema.parse(req.body);
  if (!env.OPENAI_API_KEY) {
    return res
      .status(503)
      .json({ error: "AI service not configured (missing OPENAI_API_KEY)" });
  }
  try {
    const r = await ai.ocrFssai(imageUrl);
    res.json(r);
  } catch (err: any) {
    console.error("[ai.ocrFssai]", err?.message || err);
    res.status(502).json({
      error: "AI service failure",
      detail: err?.message || "Unknown error",
    });
  }
}

export async function classifyFood(req: AuthRequest, res: Response) {
  const { imageUrl } = schema.parse(req.body);
  if (!env.OPENAI_API_KEY) {
    return res
      .status(503)
      .json({ error: "AI service not configured (missing OPENAI_API_KEY)" });
  }
  try {
    const r = await ai.classifyFood(imageUrl);
    res.json(r);
  } catch (err: any) {
    console.error("[ai.classifyFood]", err?.message || err);
    res.status(502).json({
      error: "AI service failure",
      detail: err?.message || "Unknown error",
    });
  }
}
