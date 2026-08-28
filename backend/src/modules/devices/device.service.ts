import { prisma } from "../../db/prisma.js";
import type { DeviceType } from "@prisma/client";
import { broadcast } from "../../websocket.js";

export async function registerDevice(
  name: string,
  publicKey: string,
  type: DeviceType,
  location: string,
  armed = true,
) {
  const device = await prisma.device.create({ data: { name, publicKey, type, location, armed } });
  broadcast("device_registered", device);
  return device;
}

export function listDevices() {
  return prisma.device.findMany({ orderBy: { registeredAt: "desc" } });
}

export async function updateTelemetry(
  deviceId: string,
  data: { batteryLevel?: number; armed?: boolean },
) {
  const updated = await prisma.device.update({ where: { id: deviceId }, data });
  broadcast("device_update", updated);
  return updated;
}