import { describe, it, expect } from "vitest";
import { generateParams } from "schnorr-zkp-toolkit";
import { serializeParams, deserializeParams } from "../src/modules/zkp/serialization.js";

describe("zkp params serialization", () => {
  it("round-trips params through string form without losing precision", () => {
    const original = generateParams(64);

    const serialized = serializeParams(original, 64);
    const restored = deserializeParams(serialized);

    expect(restored.p).toBe(original.p);
    expect(restored.q).toBe(original.q);
    expect(restored.g).toBe(original.g);
  });
});