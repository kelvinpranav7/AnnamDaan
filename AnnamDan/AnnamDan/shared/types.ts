/**
 * Shared types between frontend and backend.
 * Backend re-implements DTOs via Zod; this file is a single source of truth.
 */

export type UserRole = "donor" | "ngo" | "volunteer" | "public" | "admin";
export type DonationStatus = "live" | "accepted" | "picked_up" | "expired";

export interface GeoPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface AiSafetyResult {
  label: "fresh" | "slightly_stale" | "unsafe";
  confidence: number;
  shelfHours: number;
}

export interface DonationDTO {
  id: string;
  donorId: string;
  donorName: string;
  donorType: "hotel" | "wedding" | "caterer" | "individual";
  foodType: string;
  cuisine?: string;
  quantityMeals: number;
  preparedAt: string;
  pickupBy: string;
  notes?: string;
  images: string[];
  location: GeoPoint;
  status: DonationStatus;
  aiSafety?: AiSafetyResult;
  assignedNgoId?: string;
  assignedVolunteerId?: string;
  createdAt: string;
}
