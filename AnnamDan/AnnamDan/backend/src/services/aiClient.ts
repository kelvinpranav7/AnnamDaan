import OpenAI from "openai";
import { env } from "../config/env.js";

let _openai: OpenAI | null = null;
function client() {
  if (!_openai) {
    if (!env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    _openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface FoodSafetyResult {
  label: "fresh" | "slightly_stale" | "unsafe";
  confidence: number;
  shelf_hours: number;
  reasoning?: string;
  flagged_issues?: string[];
}

export interface FssaiOcrResult {
  license: string | null;
  valid: boolean;
  confidence: number;
  reasoning?: string;
}

const SAFETY_PROMPT = `You are a food safety inspector for a food rescue platform.
Analyze the food image and respond with ONLY a JSON object (no markdown fences) with these fields:

{
  "label": "fresh" | "slightly_stale" | "unsafe",
  "confidence": 0.0-1.0,
  "shelf_hours": integer between 0 and 24,
  "reasoning": "1-2 sentence explanation",
  "flagged_issues": ["array", "of", "concerns"] or []
}

Guidelines:
- "fresh" = safe to redistribute, looks freshly prepared, no visible spoilage
- "slightly_stale" = edible but should be consumed soon (under 3 hours), no spoilage but appears not freshly prepared
- "unsafe" = visible mold, severe discoloration, oil separation, rotting, or anything risky to consume
- shelf_hours = how many hours from now this food remains safe to eat at room temperature
- Be strict on safety. If unsure, lean toward slightly_stale rather than fresh.`;

const FSSAI_PROMPT = `You are reading an Indian FSSAI food license document/photo.
Respond with ONLY a JSON object (no markdown fences) with these fields:

{
  "license": "the 14-digit FSSAI license number, or null if not found",
  "valid": true if the number looks like a real 14-digit FSSAI number, false otherwise,
  "confidence": 0.0-1.0,
  "reasoning": "1 sentence about what you saw"
}

FSSAI license numbers are exactly 14 digits, often shown as "FSSAI: XXXXXXXXXXXXXX" or similar.
If the image doesn't show a license, set license=null and valid=false.`;

async function visionJSON(imageUrl: string, systemPrompt: string) {
  const resp = await client().chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    max_tokens: 400,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this image." },
          { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
        ],
      },
    ],
  });
  const raw = resp.choices[0]?.message?.content || "{}";
  return JSON.parse(raw);
}

export const ai = {
  async classifyFood(imageUrl: string): Promise<FoodSafetyResult> {
    const parsed = await visionJSON(imageUrl, SAFETY_PROMPT);
    const label =
      parsed.label === "fresh" ||
      parsed.label === "slightly_stale" ||
      parsed.label === "unsafe"
        ? parsed.label
        : "slightly_stale";
    const confidence = Math.max(
      0,
      Math.min(1, Number(parsed.confidence) || 0.5)
    );
    const shelf_hours = Math.max(
      0,
      Math.min(24, Math.round(Number(parsed.shelf_hours) || 0))
    );
    return {
      label,
      confidence,
      shelf_hours,
      reasoning: parsed.reasoning,
      flagged_issues: Array.isArray(parsed.flagged_issues)
        ? parsed.flagged_issues
        : [],
    };
  },
  async ocrFssai(imageUrl: string): Promise<FssaiOcrResult> {
    const parsed = await visionJSON(imageUrl, FSSAI_PROMPT);
    return {
      license: parsed.license || null,
      valid: !!parsed.valid,
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
      reasoning: parsed.reasoning,
    };
  },
};
