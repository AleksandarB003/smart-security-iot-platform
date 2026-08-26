import { Router } from "express";
import {
  authenticateDevice,
  DeviceNotFoundError,
  DeviceRevokedError,
  ReplayDetectedError,
  InvalidProofFormatError,
  type SerializedProof,
} from "./auth.service.js";

export const authRouter = Router();

authRouter.post("/:id/authenticate", async (req, res) => {
  const proofData = req.body as Partial<SerializedProof>;

  if (
    !proofData?.params ||
    !proofData.publicKey ||
    !proofData.commitment ||
    !proofData.challenge ||
    !proofData.response
  ) {
    return res.status(400).json({ error: "invalid proof payload" });
  }

  try {
    const success = await authenticateDevice(req.params.id, proofData as SerializedProof);
    if (!success) {
      return res.status(401).json({ success: false });
    }
    res.json({ success: true });
  } catch (error) {
    if (error instanceof DeviceNotFoundError) {
      return res.status(404).json({ error: "device not found" });
    }
    if (error instanceof DeviceRevokedError) {
      return res.status(403).json({ error: "device revoked" });
    }
    if (error instanceof ReplayDetectedError) {
      return res.status(409).json({ error: "replay detected: proof already used" });
    }
    if (error instanceof InvalidProofFormatError) {
      return res.status(400).json({ error: "proof fields must be valid numeric strings" });
    }
    throw error;
  }
});