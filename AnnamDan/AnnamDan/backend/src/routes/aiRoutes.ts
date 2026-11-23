import { Router } from "express";
import { ocrFssai, classifyFood } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";

const r = Router();
r.use(requireAuth);
r.post("/ocr/fssai", asyncHandler(ocrFssai));
// Legacy path
r.post("/cnn/safety", asyncHandler(classifyFood));
// New name
r.post("/safety", asyncHandler(classifyFood));

export default r;
