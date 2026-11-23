import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload: { uid: string; role: string; email?: string }) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET) as T;
}
