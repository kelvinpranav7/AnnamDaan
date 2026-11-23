const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined;
const BASE = "https://api.geoapify.com";

function ensureKey() {
  if (!API_KEY) throw new Error("Geoapify API key missing — set VITE_GEOAPIFY_API_KEY");
  return API_KEY;
}

export const TILE_URL = API_KEY
  ? `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${API_KEY}`
  : "";
export const TILE_ATTRIBUTION =
  '<a href="https://www.geoapify.com/" target="_blank">Powered by Geoapify</a> | <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>';

export interface GeoPlace {
  place_id: string;
  formatted: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  postcode?: string;
  lat: number;
  lon: number;
  categories?: string[];
}

export interface RouteResult {
  distanceMeters: number;
  timeSeconds: number;
  coordinates: [number, number][]; // [lat, lng] pairs
}

export const geoapifyService = {
  /** Address autocomplete — for donation form */
  async autocomplete(text: string, limit = 5): Promise<GeoPlace[]> {
    if (!text.trim()) return [];
    const url = `${BASE}/v1/geocode/autocomplete?text=${encodeURIComponent(
      text
    )}&limit=${limit}&apiKey=${ensureKey()}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || []).map((f: any) => ({
      place_id: f.properties.place_id,
      formatted: f.properties.formatted,
      address_line1: f.properties.address_line1,
      address_line2: f.properties.address_line2,
      city: f.properties.city,
      county: f.properties.county,
      state: f.properties.state,
      country: f.properties.country,
      postcode: f.properties.postcode,
      lat: f.properties.lat,
      lon: f.properties.lon,
    }));
  },

  /** Forward geocode — turn address into coordinates */
  async geocode(text: string): Promise<GeoPlace | null> {
    if (!text.trim()) return null;
    const url = `${BASE}/v1/geocode/search?text=${encodeURIComponent(
      text
    )}&limit=1&apiKey=${ensureKey()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const f = data.features?.[0];
    if (!f) return null;
    return {
      place_id: f.properties.place_id,
      formatted: f.properties.formatted,
      lat: f.properties.lat,
      lon: f.properties.lon,
      city: f.properties.city,
      county: f.properties.county,
      state: f.properties.state,
      country: f.properties.country,
      postcode: f.properties.postcode,
    };
  },

  /**
   * Lookup a postal code — returns the district/county and city/state
   * for that pincode. Used to auto-fill district when the user enters a pincode.
   */
  async lookupPincode(
    pincode: string,
    countryCode = "in"
  ): Promise<{
    district: string;
    city?: string;
    state?: string;
    country?: string;
  } | null> {
    if (!pincode.trim()) return null;
    const url = `${BASE}/v1/geocode/search?postcode=${encodeURIComponent(
      pincode
    )}&filter=countrycode:${countryCode}&limit=1&apiKey=${ensureKey()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const f = data.features?.[0];
    if (!f) return null;
    const p = f.properties;
    // "district" in Indian addresses usually maps to Geoapify's county field;
    // fall back to city or state_district if the API uses different keys.
    const district =
      p.county ||
      p.state_district ||
      p.city ||
      p.state ||
      "";
    if (!district) return null;
    return {
      district: String(district),
      city: p.city,
      state: p.state,
      country: p.country,
    };
  },

  /** Reverse geocode — turn coordinates into address */
  async reverseGeocode(lat: number, lon: number): Promise<GeoPlace | null> {
    const url = `${BASE}/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${ensureKey()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const f = data.features?.[0];
    if (!f) return null;
    return {
      place_id: f.properties.place_id,
      formatted: f.properties.formatted,
      lat: f.properties.lat,
      lon: f.properties.lon,
      city: f.properties.city,
    };
  },

  /** Places nearby — find supermarkets, food banks, etc. */
  async places(
    categories: string,
    bbox: { west: number; south: number; east: number; north: number },
    limit = 20
  ): Promise<GeoPlace[]> {
    const filter = `rect:${bbox.west},${bbox.north},${bbox.east},${bbox.south}`;
    const url = `${BASE}/v2/places?categories=${encodeURIComponent(
      categories
    )}&filter=${encodeURIComponent(
      filter
    )}&limit=${limit}&apiKey=${ensureKey()}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || []).map((f: any) => ({
      place_id: f.properties.place_id,
      formatted: f.properties.formatted,
      lat: f.properties.lat,
      lon: f.properties.lon,
      city: f.properties.city,
      categories: f.properties.categories,
    }));
  },

  /** Routing — pickup → drop-off, returns coordinates + distance + ETA */
  async route(
    from: { lat: number; lon: number },
    to: { lat: number; lon: number },
    mode: "drive" | "bicycle" | "walk" = "drive"
  ): Promise<RouteResult | null> {
    const waypoints = `${from.lat},${from.lon}|${to.lat},${to.lon}`;
    const url = `${BASE}/v1/routing?waypoints=${encodeURIComponent(
      waypoints
    )}&mode=${mode}&apiKey=${ensureKey()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const f = data.features?.[0];
    if (!f) return null;
    const props = f.properties;
    const geom = f.geometry;
    let coords: [number, number][] = [];
    if (geom.type === "LineString") {
      coords = geom.coordinates.map((c: number[]) => [c[1], c[0]]);
    } else if (geom.type === "MultiLineString") {
      coords = geom.coordinates.flat().map((c: number[]) => [c[1], c[0]]);
    }
    return {
      distanceMeters: props.distance,
      timeSeconds: props.time,
      coordinates: coords,
    };
  },
};

export const isGeoapifyConfigured = !!API_KEY;
