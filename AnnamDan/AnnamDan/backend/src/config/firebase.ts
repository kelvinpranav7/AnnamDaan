import admin from "firebase-admin";
import tls from "node:tls";
import { env } from "./env.js";

let initialized = false;

export function initFirebase() {
  if (initialized || !env.FIREBASE_PROJECT_ID) return;

  // On Windows, Node's bundled CA store often misses corporate/system roots
  // that the Firestore gRPC client needs. Try to merge OS-trusted roots if
  // available (Node >= 22) so the TLS handshake to firestore.googleapis.com
  // succeeds. Falls back silently on older runtimes.
  try {
    const systemCerts = (tls as any).getCACertificates?.("system") as
      | string[]
      | undefined;
    if (systemCerts?.length) {
      const bundled = tls.rootCertificates;
      const merged = Array.from(new Set([...bundled, ...systemCerts]));
      (tls as any).setDefaultCACertificates?.(merged);
    }
  } catch {
    // ignore — fall back to default CA bundle
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    }),
    storageBucket: env.FIREBASE_STORAGE_BUCKET || undefined,
  });
  initialized = true;
}

export const firestore = () => (initialized ? admin.firestore() : null);
export const adminAuth = () => (initialized ? admin.auth() : null);
export const storageBucket = () =>
  initialized && env.FIREBASE_STORAGE_BUCKET
    ? admin.storage().bucket()
    : null;
