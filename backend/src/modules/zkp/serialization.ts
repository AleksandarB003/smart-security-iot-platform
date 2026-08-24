import type { PublicParams } from "schnorr-zkp-toolkit";

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