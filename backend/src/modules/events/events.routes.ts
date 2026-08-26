import { Router } from "express";
import type { Severity } from "@prisma/client";
import {
  resolveDeviceSession,
  DeviceNotFoundError as SessionDeviceNotFoundError,
} from "../auth/auth.service.js";
import {
  recordEvent,
  listRecentEvents,
  listDeviceEvents,
  DeviceNotFoundError,
  DeviceNotActiveError,
} from "./events.service.js";

const VALID_SEVERITIES = new Set(["INFO", "WARNING", "CRITICAL"]);

export const eventRouter = Router();

eventRouter.post("/:id/events", async (req, res) => {
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

  const { type, severity, payload } = req.body;

  if (typeof type !== "string" || type.trim() === "") {
    return res.status(400).json({ error: "type is required" });
  }
  const finalSeverity = severity ?? "INFO";
  if (!VALID_SEVERITIES.has(finalSeverity)) {
    return res.status(400).json({ error: "severity must be INFO, WARNING, or CRITICAL" });
  }

  try {
    const event = await recordEvent(req.params.id, type, finalSeverity as Severity, payload);
    res.status(201).json(event);
  } catch (error) {
    if (error instanceof DeviceNotFoundError) {
      return res.status(404).json({ error: "device not found" });
    }
    if (error instanceof DeviceNotActiveError) {
      return res.status(403).json({ error: "device is not authenticated" });
    }
    throw error;
  }
});

eventRouter.get("/:id/events", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  res.json(await listDeviceEvents(req.params.id, limit));
});

export const globalEventsRouter = Router();

globalEventsRouter.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  res.json(await listRecentEvents(limit));
});