import { prisma } from "../../db/prisma.js";

export function registerDevice(name: string, publicKey: string) {
  return prisma.device.create({ data: { name, publicKey } });
}

export function listDevices() {
  return prisma.device.findMany({ orderBy: { registeredAt: "desc" } });
}