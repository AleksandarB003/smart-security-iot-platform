import { randomBytes } from "node:crypto";
import { verify } from "schnorr-zkp-toolkit";
import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { deserializeParams, type SerializedParams } from "../zkp/serialization.js";
import { broadcast } from "../../websocket.js";
import { stripSecret } from "../devices/device.service.js";

const SESSION_DURATION_MS = 60 * 60 * 1000;

export interface SerializedProof {
  params: SerializedParams;
  publicKey: string;
  commitment: string;
  challenge: string;
  response: string;
}

export class DeviceNotFoundError extends Error {}
export class DeviceRevokedError extends Error {}
export class ReplayDetectedError extends Error {}
export class InvalidProofFormatError extends Error {}

export interface AuthResult {
  success: boolean;
  sessionToken?: string;
  sessionExpiresAt?: Date;
}

export async function authenticateDevice(
  deviceId: string,
  proofData: SerializedProof,
): Promise<AuthResult> {
  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) throw new DeviceNotFoundError();
  if (device.status === "REVOKED") throw new DeviceRevokedError();

  let proof;
  try {
    proof = {
      params: deserializeParams(proofData.params),
      publicKey: BigInt(proofData.publicKey),
      commitment: BigInt(proofData.commitment),
      challenge: BigInt(proofData.challenge),
      response: BigInt(proofData.response),
    };
  } catch {
    throw new InvalidProofFormatError();
  }

  const publicKeyMatches = proofData.publicKey === device.publicKey;
  const cryptoValid = verify(proof);
  const success = publicKeyMatches && cryptoValid;

  try {
    await prisma.proofLog.create({
      data: {
        deviceId: device.id,
        commitment: proofData.commitment,
        challenge: proofData.challenge,
        response: proofData.response,
        success,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ReplayDetectedError();
    }
    throw error;
  }

  if (!success) {
    return { success: false };
  }

  const sessionToken = randomBytes(32).toString("hex");
  const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const updatedDevice = await prisma.device.update({
    where: { id: device.id },
    data: { status: "ACTIVE", lastSeenAt: new Date(), sessionToken, sessionExpiresAt },
  });
  broadcast("device_update", stripSecret(updatedDevice));

  return { success: true, sessionToken, sessionExpiresAt };
}

export async function resolveDeviceSession(deviceId: string, token: string) {
  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) throw new DeviceNotFoundError();

  const tokenValid = device.sessionToken === token;
  const notExpired = device.sessionExpiresAt !== null && device.sessionExpiresAt > new Date();

  if (!tokenValid || !notExpired) {
    return null;
  }
  return device;
}