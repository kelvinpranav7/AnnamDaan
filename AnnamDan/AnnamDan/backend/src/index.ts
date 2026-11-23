import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { initFirebase } from "./config/firebase.js";
import { errorHandler, notFound } from "./middleware/error.js";

import authRoutes from "./routes/authRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import ngoRoutes from "./routes/ngoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

initFirebase();

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "5mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    limit: 200,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

app.get("/health", (_req, res) =>
  res.json({ ok: true, service: "annam-daan-api", time: new Date().toISOString() })
);

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🌶️  Annam Daan API on :${env.PORT}`);
});
