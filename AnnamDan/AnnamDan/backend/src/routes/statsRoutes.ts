import { Router } from "express";
import {
  impact,
  trend,
  foodTypes,
  responseTimes,
} from "../controllers/statsController.js";
import { asyncHandler } from "../middleware/error.js";

const r = Router();
r.get("/impact", asyncHandler(impact));
r.get("/trend", asyncHandler(trend));
r.get("/food-types", asyncHandler(foodTypes));
r.get("/response-times", asyncHandler(responseTimes));

export default r;
