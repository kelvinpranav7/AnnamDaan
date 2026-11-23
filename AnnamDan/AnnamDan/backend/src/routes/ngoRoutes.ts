import { Router } from "express";
import { list } from "../controllers/ngoController.js";
import { asyncHandler } from "../middleware/error.js";

const r = Router();
r.get("/", asyncHandler(list));

export default r;
