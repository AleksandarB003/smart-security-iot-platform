import { generateKeyPair, prove } from "schnorr-zkp-toolkit";
import { deserializeParams, serializeParams } from "../src/modules/zkp/serialization.js";

const BASE_URL = "http://localhost:3000";

async function main() {
  console.log("1. Fetching platform ZKP params...");
  const paramsRes = await fetch(`${BASE_URL}/api/zkp/params`);
  const serializedParams = await paramsRes.json();
  const params = deserializeParams(serializedParams);
  console.log("   OK -", serializedParams);

  console.log("2. Generating device key pair...");
  const keyPair = generateKeyPair(params);
  const publicKey = keyPair.publicKey.toString();
  console.log("   OK - publicKey:", publicKey);

  console.log("3. Registering device...");
  const registerRes = await fetch(`${BASE_URL}/api/devices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Simulated test device", publicKey }),
  });
  const device = await registerRes.json();
  console.log("   OK -", device);

  console.log("4. Generating ZKP proof...");
  const proof = prove(keyPair);
  const proofPayload = {
    params: serializeParams(proof.params, serializedParams.bits),
    publicKey: proof.publicKey.toString(),
    commitment: proof.commitment.toString(),
    challenge: proof.challenge.toString(),
    response: proof.response.toString(),
  };

  console.log("5. Authenticating device...");
  const authRes = await fetch(`${BASE_URL}/api/devices/${device.id}/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proofPayload),
  });
  console.log("   Status:", authRes.status, "-", await authRes.json());

  console.log("\n6. Replaying the exact same proof (should be rejected)...");
  const replayRes = await fetch(`${BASE_URL}/api/devices/${device.id}/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proofPayload),
  });
  console.log("   Status:", replayRes.status, "-", await replayRes.json());
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});