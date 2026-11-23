export type DonationStatus = "live" | "accepted" | "picked_up" | "expired";

export interface GeoPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorType: "hotel" | "wedding" | "caterer" | "individual" | "volunteer";
  source?: "institutional" | "community";
  foodType: string;
  quantityMeals: number;
  preparedAt: string;
  pickupBy: string;
  notes?: string;
  images: string[];
  district?: string;
  pincode?: string;
  location: GeoPoint;
  status: DonationStatus;
  aiSafety?: {
    label: "fresh" | "slightly_stale" | "unsafe";
    confidence: number;
    shelfHours: number;
  };
  assignedNgoId?: string;
  assignedVolunteerId?: string;
  createdAt: string;
}

export interface NgoOrg {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  capacityMeals: number;
  reach: number;
  location: GeoPoint;
  needs?: string[];
}

export interface ImpactMetrics {
  mealsServed: number;
  kgRescued: number;
  co2Saved: number;
  activeDonors: number;
  activeNgos: number;
  cities: number;
}
