import { Router } from "express";
import { login, register, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";

const r = Router();
r.post("/login", asyncHandler(login));
r.post("/register", asyncHandler(register));
r.get("/me", requireAuth, asyncHandler(me));

export default r;
