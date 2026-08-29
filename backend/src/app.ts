import express from "express";
import cors from "cors";
import { prisma } from "./db/prisma.js";
import { zkpRouter } from "./modules/zkp/zkp.routes.js";
import { deviceRouter } from "./modules/devices/device.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { eventRouter, globalEventsRouter } from "./modules/events/events.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/zkp", zkpRouter);
app.use("/api/devices", deviceRouter);
app.use("/api/devices", authRouter);
app.use("/api/devices", eventRouter);
app.use("/api/events", globalEventsRouter);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});