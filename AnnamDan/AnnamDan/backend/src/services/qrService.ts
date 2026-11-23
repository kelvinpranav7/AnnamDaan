import crypto from "node:crypto";
import { env } from "../config/env.js";

interface QrPayload {
  donationId: string;
  ngoId: string;
  lat: number;
  lng: number;
  issuedAt: number;
  expiresAt: number;
}

function b64url(buf: Buffer | string) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function issueQr(payload: Omit<QrPayload, "issuedAt" | "expiresAt">, ttlMin = 30) {
  const full: QrPayload = {
    ...payload,
    issuedAt: Date.now(),
    expiresAt: Date.now() + ttlMin * 60_000,
  };
  const body = b64url(JSON.stringify(full));
  const sig = crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(body)
    .digest();
  return `${body}.${b64url(sig)}`;
}

export function verifyQr(token: string, opts: { withinMeters?: number; gps?: { lat: number; lng: number } } = {}) {
  const [body, sig] = token.split(".");
  if (!body || !sig) return { ok: false, reason: "Malformed" };
  const expected = crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(body)
    .digest();
  if (b64url(expected) !== sig) return { ok: false, reason: "Bad signature" };
  const payload: QrPayload = JSON.parse(
    Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
  );
  if (Date.now() > payload.expiresAt) return { ok: false, reason: "Expired" };
  if (opts.gps && opts.withinMeters) {
    const d = haversineMeters(opts.gps, { lat: payload.lat, lng: payload.lng });
    if (d > opts.withinMeters) return { ok: false, reason: "Outside geofence" };
  }
  return { ok: true, payload };
}

function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}
