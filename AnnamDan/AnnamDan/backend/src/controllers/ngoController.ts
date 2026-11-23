import type { Request, Response } from "express";
import { firestore } from "../config/firebase.js";

export async function list(_req: Request, res: Response) {
  const f = firestore();
  if (!f) return res.json([]);
  const snap = await f.collection("ngos").get();
  res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}
