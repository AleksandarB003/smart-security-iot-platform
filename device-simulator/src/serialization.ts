import type { PublicParams } from "schnorr-zkp-toolkit";

// Duplicated from backend/src/modules/zkp/serialization.ts. The simulator
// and backend are separate npm packages (no shared workspace), and this
// helper is ~15 lines - not worth the setup cost of a shared package for.
export interface SerializedParams {
  bits: number;
  p: string;
  q: string;
  g: string;
}

export function serializeParams(params: PublicParams, bits: number): SerializedParams {
  return {
    bits,
    p: params.p.toString(),
    q: params.q.toString(),
    g: params.g.toString(),
  };
}

export function deserializeParams(data: SerializedParams): PublicParams {
  return {
    p: BigInt(data.p),
    q: BigInt(data.q),
    g: BigInt(data.g),
  };
}