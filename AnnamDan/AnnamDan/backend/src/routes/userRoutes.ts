import { Router } from "express";
import { list } from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";

const r = Router();
r.use(requireAuth, requireRole("admin"));
r.get("/", asyncHandler(list));

export default r;
