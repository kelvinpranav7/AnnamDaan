import type { Response } from "express";
import { v4 as uuid } from "uuid";
import { storageBucket } from "../config/firebase.js";
import type { AuthRequest } from "../middleware/auth.js";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_DATAURL_BYTES = 2 * 1024 * 1024; // 2 MB raw -> ~2.7 MB base64

/**
 * Uploads an image. Strategy:
 *   1. Try Firebase Storage (preferred — returns a public CDN URL).
 *   2. If Storage is not configured / bucket missing, fall back to a
 *      base64 data URL. Firestore docs can hold this directly and
 *      OpenAI Vision accepts data URLs in image_url.
 */
export async function uploadImage(req: AuthRequest, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: "No file uploaded" });
  if (!ALLOWED_TYPES.has(file.mimetype)) {
    return res.status(400).json({ error: "Unsupported image type" });
  }
  if (file.size > MAX_BYTES) {
    return res.status(400).json({ error: "Image must be under 8 MB" });
  }

  const uid = req.user?.uid ?? "anonymous";
  const ext = file.mimetype.split("/")[1] || "jpg";

  // --- Try Firebase Storage first ---
  const bucket = storageBucket();
  if (bucket) {
    try {
      const path = `donations/${uid}/${Date.now()}-${uuid().slice(0, 8)}.${ext}`;
      const token = uuid();
      const blob = bucket.file(path);
      await blob.save(file.buffer, {
        contentType: file.mimetype,
        metadata: {
          metadata: { firebaseStorageDownloadTokens: token },
        },
        resumable: false,
      });
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
        path
      )}?alt=media&token=${token}`;
      return res.status(201).json({ url, path, storage: "firebase" });
    } catch (err: any) {
      console.warn(
        "[upload] Firebase Storage failed, falling back to data URL:",
        err?.message || err
      );
      // fall through
    }
  }

  // --- Fallback: base64 data URL ---
  if (file.size > MAX_DATAURL_BYTES) {
    return res.status(400).json({
      error:
        "Image too large for inline storage (max 2 MB without Firebase Storage)",
    });
  }
  const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  return res.status(201).json({
    url: dataUrl,
    storage: "inline",
  });
}
