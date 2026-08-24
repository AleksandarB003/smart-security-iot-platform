import { Router } from "express";
import { Prisma } from "@prisma/client";
import { registerDevice, listDevices } from "./device.service.js";

export const deviceRouter = Router();

deviceRouter.post("/", async (req, res) => {
  const { name, publicKey } = req.body;

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "name is required" });
  }
  if (typeof publicKey !== "string" || publicKey.trim() === "") {
    return res.status(400).json({ error: "publicKey is required" });
  }

  try {
    const device = await registerDevice(name, publicKey);
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