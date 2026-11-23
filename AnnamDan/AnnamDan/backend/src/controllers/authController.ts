import type { Request, Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import { signToken } from "../services/tokenService.js";
import { firestore } from "../config/firebase.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["donor", "ngo", "volunteer", "admin"]).optional(),
});

function uidFor(email: string) {
  const cleanEmail = email.toLowerCase().trim();
  return "u_" + crypto.createHash("sha256").update(cleanEmail).digest("hex").slice(0, 12);
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedValue: string): boolean {
  const [salt, originalHash] = storedValue.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export async function login(req: Request, res: Response) {
  const { email, password, role } = loginSchema.parse(req.body);
  const uid = uidFor(email);

  const f = firestore();
  let user: Record<string, unknown> = {
    uid,
    role: role || "donor",
    email,
  };

  if (f) {
    const doc = await f.collection("users").doc(uid).get();
    if (doc.exists) {
      user = { uid, ...doc.data() };
      // Verify password
      if (user.passwordHash) {
        const isValid = verifyPassword(password, user.passwordHash as string);
        if (!isValid) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
      } else {
        // Migration path: hash the password and update the user record
        const passwordHash = hashPassword(password);
        await f.collection("users").doc(uid).update({ passwordHash });
      }
    } else {
      // Create user
      const created = {
        uid,
        email,
        name: email.split("@")[0],
        role: role || "donor",
        verified: false,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      await f.collection("users").doc(uid).set(created);
      user = created;
    }
  }

  const token = signToken({
    uid,
    role: (user.role as string) || "donor",
    email,
  });
  res.json({ token, user });
}

const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  phone: z.string().min(10),
  district: z.string().trim().min(2).optional(),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "Pincode must be 4–8 digits")
    .optional(),
});

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const uid = uidFor(data.email);
  const role = data.role || "donor";

  // NGO + donor + volunteer must have a district + pincode so location matching works.
  if (role !== "admin" && (!data.district || !data.pincode)) {
    return res.status(400).json({
      error: "District and pincode are required for this role",
    });
  }

  const user: Record<string, unknown> = {
    uid,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role,
    verified: false,
    passwordHash: hashPassword(data.password),
    createdAt: new Date().toISOString(),
  };
  if (data.district) user.district = data.district.trim();
  if (data.pincode) user.pincode = data.pincode.trim();

  const f = firestore();
  if (f) {
    await f.collection("users").doc(uid).set(user, { merge: true });
  }

  const token = signToken({ uid, role, email: data.email });
  res.status(201).json({ token, user });
}

export async function me(req: any, res: Response) {
  res.json({ user: req.user });
}
