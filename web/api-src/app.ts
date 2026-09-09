import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { router } from "./routes.js";

export const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use("/api", router);
app.get("/api/health", (_req, res) => res.json({ ok: true }));
