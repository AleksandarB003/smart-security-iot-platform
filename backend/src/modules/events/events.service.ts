import { prisma } from "../../db/prisma.js";
import type { Severity } from "@prisma/client";

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

  return prisma.securityEvent.create({
    data: { deviceId, type, severity, payload: payload as any },
  });
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