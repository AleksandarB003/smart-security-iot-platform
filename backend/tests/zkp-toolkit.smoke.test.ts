import { describe, it, expect } from "vitest";
import { generateParams, generateKeyPair, prove, verify } from "schnorr-zkp-toolkit";

const TEST_BITS = 64;

describe("schnorr-zkp-toolkit integration", () => {
  it("verifies a valid proof", () => {
    const params = generateParams(TEST_BITS);
    const keyPair = generateKeyPair(params);
    const proof = prove(keyPair);

    expect(verify(proof)).toBe(true);
  });

  it("rejects a proof for the wrong public key", () => {
    const params = generateParams(TEST_BITS);
    const keyPair = generateKeyPair(params);
    const otherKeyPair = generateKeyPair(params);
    const proof = prove(keyPair);

    const forgedProof = { ...proof, publicKey: otherKeyPair.publicKey };

    expect(verify(forgedProof)).toBe(false);
  });
});