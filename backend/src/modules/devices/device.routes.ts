import { Router } from "express";
import { Prisma, type DeviceType } from "@prisma/client";
import { registerDevice, listDevices, updateTelemetry } from "./device.service.js";
import {
  resolveDeviceSession,
  DeviceNotFoundError as SessionDeviceNotFoundError,
} from "../auth/auth.service.js";

export const deviceRouter = Router();

const VALID_TYPES = new Set(["MOTION", "DOOR", "SMOKE", "CAMERA", "GLASS_BREAK"]);

deviceRouter.post("/", async (req, res) => {
  const { name, publicKey, type, armed } = req.body;

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "name is required" });
  }
  if (typeof publicKey !== "string" || publicKey.trim() === "") {
    return res.status(400).json({ error: "publicKey is required" });
  }
  if (typeof type !== "string" || !VALID_TYPES.has(type)) {
    return res.status(400).json({ error: `type must be one of: ${[...VALID_TYPES].join(", ")}` });
  }

  try {
    const device = await registerDevice(
      name,
      publicKey,
      type as DeviceType,
      typeof armed === "boolean" ? armed : true,
    );
    res.status(201).json(device);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "publicKey already registered" });
    }
    throw error;
  }
});

deviceRouter.get("/", async (_req, res) => {
  res.json(await listDevices());
});

deviceRouter.patch("/:id/telemetry", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) {
    return res.status(401).json({ error: "missing session token" });
  }

  try {
    const device = await resolveDeviceSession(req.params.id, token);
    if (!device) {
      return res.status(401).json({ error: "invalid or expired session token" });
    }
  } catch (error) {
    if (error instanceof SessionDeviceNotFoundError) {
      return res.status(404).json({ error: "device not found" });
    }
    throw error;
  }

  const { batteryLevel, armed } = req.body;
  const data: { batteryLevel?: number; armed?: boolean } = {};

  if (batteryLevel !== undefined) {
    if (typeof batteryLevel !== "number" || batteryLevel < 0 || batteryLevel > 100) {
      return res.status(400).json({ error: "batteryLevel must be a number between 0 and 100" });
    }
    data.batteryLevel = batteryLevel;
  }
  if (armed !== undefined) {
    if (typeof armed !== "boolean") {
      return res.status(400).json({ error: "armed must be a boolean" });
    }
    data.armed = armed;
  }

  const updated = await updateTelemetry(req.params.id, data);
  res.json(updated);
});