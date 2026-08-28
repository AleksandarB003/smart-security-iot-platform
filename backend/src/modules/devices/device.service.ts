import { prisma } from "../../db/prisma.js";
import type { DeviceType } from "@prisma/client";

export function registerDevice(
  name: string,
  publicKey: string,
  type: DeviceType,
  location: string,
  armed = true,
) {
  return prisma.device.create({ data: { name, publicKey, type, location, armed } });
}

export function listDevices() {
  return prisma.device.findMany({ orderBy: { registeredAt: "desc" } });
}

export function updateTelemetry(
  deviceId: string,
  data: { batteryLevel?: number; armed?: boolean },
) {
  return prisma.device.update({ where: { id: deviceId }, data });
}