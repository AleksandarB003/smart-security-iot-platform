import { verify } from "schnorr-zkp-toolkit";
import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { deserializeParams, type SerializedParams } from "../zkp/serialization.js";

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

export async function authenticateDevice(
  deviceId: string,
  proofData: SerializedProof,
): Promise<boolean> {
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

  if (success) {
    await prisma.device.update({
      where: { id: device.id },
      data: { status: "ACTIVE", lastSeenAt: new Date() },
    });
  }

  return success;
}