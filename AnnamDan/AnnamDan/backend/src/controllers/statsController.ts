import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";

const KG_PER_MEAL = 0.25;
const CO2_PER_MEAL = 1.9;

export async function impact(_req: Request, res: Response) {
  const f = firestore();
  if (!f) {
    return res.json({
      mealsServed: 0,
      kgRescued: 0,
      co2Saved: 0,
      activeDonors: 0,
      activeNgos: 0,
      cities: 0,
    });
  }

  const [donationsSnap, ngosSnap] = await Promise.all([
    f.collection("donations").get(),
    f.collection("ngos").where("verified", "==", true).get(),
  ]);

  const donations = donationsSnap.docs.map((d) => d.data() as any);
  const served = donations.filter((d) => d.status === "picked_up");
  const mealsServed = served.reduce(
    (s, d) => s + (Number(d.quantityMeals) || 0),
    0
  );
  const activeDonors = new Set(donations.map((d) => d.donorId)).size;
  const cities = new Set(
    donations
      .map((d) => (d.location?.address || "").split(",").pop()?.trim())
      .filter(Boolean)
  ).size;

  res.json({
    mealsServed,
    kgRescued: Math.round(mealsServed * KG_PER_MEAL),
    co2Saved: Math.round(mealsServed * CO2_PER_MEAL),
    activeDonors,
    activeNgos: ngosSnap.size,
    cities,
  });
}

export async function trend(_req: Request, res: Response) {
  const f = firestore();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const buckets: { day: string; donations: number; meals: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({ day: days[d.getDay()], donations: 0, meals: 0 });
  }
  if (!f) return res.json(buckets);

  const since = new Date(now);
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const snap = await f
    .collection("donations")
    .where("createdAt", ">=", since.toISOString())
    .get();

  for (const doc of snap.docs) {
    const d = doc.data() as any;
    const created = new Date(d.createdAt);
    const diff = Math.floor(
      (created.getTime() - since.getTime()) / (24 * 60 * 60 * 1000)
    );
    if (diff < 0 || diff > 6) continue;
    buckets[diff].donations += 1;
    buckets[diff].meals += Number(d.quantityMeals) || 0;
  }

  res.json(buckets);
}

export async function foodTypes(_req: Request, res: Response) {
  const f = firestore();
  if (!f) return res.json([]);

  const snap = await f.collection("donations").get();
  const counts = new Map<string, number>();
  for (const doc of snap.docs) {
    const d = doc.data() as any;
    const key = categorize(String(d.foodType || ""));
    counts.set(key, (counts.get(key) || 0) + (Number(d.quantityMeals) || 0));
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return res.json([]);

  res.json(
    [...counts.entries()]
      .map(([name, value]) => ({
        name,
        value: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value)
  );
}

function categorize(s: string): string {
  const t = s.toLowerCase();
  if (/rice|curry|biryani|dal|sambar/.test(t)) return "Rice & Curry";
  if (/bread|chapati|roti|naan|paratha/.test(t)) return "Breads";
  if (/sweet|laddu|halwa|jalebi|kheer/.test(t)) return "Sweets";
  if (/snack|samosa|pakora|vada/.test(t)) return "Snacks";
  if (/juice|water|drink|beverage|tea|coffee/.test(t)) return "Beverages";
  return "Other";
}

export async function responseTimes(_req: Request, res: Response) {
  const f = firestore();
  const slots = ["9a", "11a", "1p", "3p", "5p", "7p", "9p"];
  const empty = slots.map((hour) => ({ hour, minutes: 0 }));
  if (!f) return res.json(empty);

  const snap = await f
    .collection("donations")
    .where("status", "in", ["accepted", "picked_up"])
    .get();

  const sums = new Array(slots.length).fill(0);
  const counts = new Array(slots.length).fill(0);

  for (const doc of snap.docs) {
    const d = doc.data() as any;
    if (!d.acceptedAt || !d.createdAt) continue;
    const created = new Date(d.createdAt);
    const accepted = new Date(d.acceptedAt);
    const minutes = (accepted.getTime() - created.getTime()) / 60000;
    if (minutes < 0 || minutes > 24 * 60) continue;
    const idx = slotIndex(created.getHours());
    if (idx < 0) continue;
    sums[idx] += minutes;
    counts[idx] += 1;
  }

  res.json(
    slots.map((hour, i) => ({
      hour,
      minutes: counts[i] ? Math.round(sums[i] / counts[i]) : 0,
    }))
  );
}

function slotIndex(hour: number): number {
  const map: Record<number, number> = {
    9: 0,
    10: 0,
    11: 1,
    12: 1,
    13: 2,
    14: 2,
    15: 3,
    16: 3,
    17: 4,
    18: 4,
    19: 5,
    20: 5,
    21: 6,
    22: 6,
  };
  return map[hour] ?? -1;
}
