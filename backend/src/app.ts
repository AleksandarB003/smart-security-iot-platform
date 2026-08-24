import express from "express";
import { prisma } from "./db/prisma.js";
import { zkpRouter } from "./modules/zkp/zkp.route.js";
import { deviceRouter } from "./modules/devices/device.routes.js";

export const app = express();

app.use(express.json());

app.use("/api/zkp", zkpRouter);

app.use("/api/devices", deviceRouter);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});