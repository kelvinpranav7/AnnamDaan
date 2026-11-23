interface Geo {
  lat: number;
  lng: number;
}
interface Donation {
  id: string;
  location: Geo;
  quantityMeals: number;
  pickupBy: string;
}
interface Ngo {
  id: string;
  location: Geo;
  capacityMeals: number;
  rating: number;
  reliability: number; // 0..1
}

export function rankNgos(donation: Donation, ngos: Ngo[]) {
  const now = Date.now();
  const windowMin = Math.max(
    1,
    (new Date(donation.pickupBy).getTime() - now) / 60_000
  );

  return ngos
    .map((n) => {
      const distance = haversineKm(donation.location, n.location);
      const capacityFit = Math.min(1, n.capacityMeals / donation.quantityMeals);
      // Lower distance is better, higher rating/reliability is better
      const score =
        capacityFit * 0.35 +
        (n.rating / 5) * 0.2 +
        n.reliability * 0.2 +
        Math.max(0, 1 - distance / 8) * 0.2 +
        Math.min(1, 60 / windowMin) * 0.05;
      return { ngo: n, distance, score };
    })
    .sort((a, b) => b.score - a.score);
}

function haversineKm(a: Geo, b: Geo) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}
