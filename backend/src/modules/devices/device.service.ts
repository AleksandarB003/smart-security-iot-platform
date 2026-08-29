import { prisma } from "../../db/prisma.js";
import type { DeviceType, Device } from "@prisma/client";
import { broadcast } from "../../websocket.js";

export function stripSecret(device: Device) {
  const { sessionToken, ...publicDevice } = device;
  return publicDevice;
}

export async function registerDevice(
  name: string,
  publicKey: string,
  type: DeviceType,
  location: string,
  armed = true,
) {
  const device = await prisma.device.create({ data: { name, publicKey, type, location, armed } });
  const publicDevice = stripSecret(device);
  broadcast("device_registered", publicDevice);
  return publicDevice;
}

export async function listDevices() {
  const devices = await prisma.device.findMany({ orderBy: { registeredAt: "desc" } });
  return devices.map(stripSecret);
}

export async function updateTelemetry(
  deviceId: string,
  data: { batteryLevel?: number; armed?: boolean },
) {
  const updated = await prisma.device.update({ where: { id: deviceId }, data });
  const publicDevice = stripSecret(updated);
  broadcast("device_update", publicDevice);
  return publicDevice;
}