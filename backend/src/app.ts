import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";

import { env } from "./config/env";
import songsRoutes from "./routes/songs.routes";
import sectionsRoutes from "./routes/sections.routes";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();

// ── Security & compression ────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(",").map((o: string) => o.trim()),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(compression());

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging ───────────────────────────────────────────────────────────
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Health check (no auth required) ──────────────────────────────────────────
app.get("/health", (_req: import("express").Request, res: import("express").Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/songs", songsRoutes);
app.use("/sections", sectionsRoutes);

// ── 404 + Global error handler (must be last) ─────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
