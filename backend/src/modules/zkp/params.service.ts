import { generateParams } from "schnorr-zkp-toolkit";
import { prisma } from "../../db/prisma.js";
import { serializeParams, type SerializedParams } from "./serialization.js";

const PLATFORM_BITS = 128;

export async function getPlatformParams(): Promise<SerializedParams> {
  const existing = await prisma.zkpParams.findUnique({ where: { id: 1 } });
  if (existing) {
    return { bits: existing.bits, p: existing.p, q: existing.q, g: existing.g };
  }

  const params = generateParams(PLATFORM_BITS);
  const serialized = serializeParams(params, PLATFORM_BITS);

  await prisma.zkpParams.create({
    data: { id: 1, bits: PLATFORM_BITS, p: serialized.p, q: serialized.q, g: serialized.g },
  });

  return serialized;
}