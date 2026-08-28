import { prisma } from "../../db/prisma.js";
import type { Severity } from "@prisma/client";
import { broadcast } from "../../websocket.js";

export class DeviceNotFoundError extends Error {}
export class DeviceNotActiveError extends Error {}

export async function recordEvent(
  deviceId: string,
  type: string,
  severity: Severity,
  payload?: unknown,
) {
  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) throw new DeviceNotFoundError();
  if (device.status !== "ACTIVE") throw new DeviceNotActiveError();

  const event = await prisma.securityEvent.create({
    data: { deviceId, type, severity, payload: payload as any },
  });

  broadcast("event", { ...event, deviceName: device.name, deviceLocation: device.location });

  return event;
}

export function listRecentEvents(limit: number) {
  return prisma.securityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { device: { select: { name: true } } },
  });
}

export function listDeviceEvents(deviceId: string, limit: number) {
  return prisma.securityEvent.findMany({
    where: { deviceId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}