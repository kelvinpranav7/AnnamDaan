import { api } from "@/api/client";

export interface FoodSafety {
  label: "fresh" | "slightly_stale" | "unsafe";
  confidence: number;
  shelf_hours: number;
  reasoning?: string;
  flagged_issues?: string[];
}

export interface FssaiOcr {
  license: string | null;
  valid: boolean;
  confidence: number;
  reasoning?: string;
}

export const aiService = {
  async classifyFood(imageUrl: string): Promise<FoodSafety> {
    const { data } = await api.post<FoodSafety>("/ai/safety", { imageUrl });
    return data;
  },
  async ocrFssai(imageUrl: string): Promise<FssaiOcr> {
    const { data } = await api.post<FssaiOcr>("/ai/ocr/fssai", { imageUrl });
    return data;
  },
};
