import { api } from "@/api/client";
import type { ImpactMetrics } from "@/types";

export interface TrendPoint {
  day: string;
  donations: number;
  meals: number;
}

export interface FoodTypeSlice {
  name: string;
  value: number;
}

export interface ResponseTimePoint {
  hour: string;
  minutes: number;
}

export const statsService = {
  async impact(): Promise<ImpactMetrics> {
    const { data } = await api.get<ImpactMetrics>("/stats/impact");
    return data;
  },
  async trend(): Promise<TrendPoint[]> {
    const { data } = await api.get<TrendPoint[]>("/stats/trend");
    return data;
  },
  async foodTypes(): Promise<FoodTypeSlice[]> {
    const { data } = await api.get<FoodTypeSlice[]>("/stats/food-types");
    return data;
  },
  async responseTimes(): Promise<ResponseTimePoint[]> {
    const { data } = await api.get<ResponseTimePoint[]>("/stats/response-times");
    return data;
  },
};
