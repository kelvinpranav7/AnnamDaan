import { Router } from "express";
import { issue, verify } from "../controllers/qrController.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);
r.post("/issue", issue);
r.post("/verify", verify);

export default r;
