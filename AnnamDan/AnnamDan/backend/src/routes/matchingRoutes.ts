import { Router } from "express";
import { match } from "../controllers/matchingController.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);
r.post("/", match);

export default r;
