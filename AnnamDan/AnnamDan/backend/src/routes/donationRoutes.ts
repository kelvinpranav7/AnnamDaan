import { Router } from "express";
import {
  create,
  get,
  list,
  listPublic,
  remove,
  updateStatus,
  update,
} from "../controllers/donationController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";

const r = Router();

r.get("/public", asyncHandler(listPublic));

r.use(requireAuth);
r.get("/", asyncHandler(list));
r.get("/:id", asyncHandler(get));
r.post("/", requireRole("donor", "volunteer"), asyncHandler(create));
r.patch("/:id", requireRole("donor", "volunteer", "admin"), asyncHandler(update));
r.patch("/:id/status", asyncHandler(updateStatus));
r.delete("/:id", asyncHandler(remove));

export default r;
