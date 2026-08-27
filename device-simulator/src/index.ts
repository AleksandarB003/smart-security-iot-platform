import { fetchPlatformParams } from "./apiClient.js";
import { deserializeParams } from "./serialization.js";
import { SimulatedDevice } from "./simulatedDevice.js";
import { MIN_DEVICES, MAX_DEVICES } from "./config.js";

async function main() {
  console.log("Fetching platform ZKP params...");
  const serializedParams = await fetchPlatformParams();
  const params = deserializeParams(serializedParams);

  const count = MIN_DEVICES + Math.floor(Math.random() * (MAX_DEVICES - MIN_DEVICES + 1));
  console.log(`Spinning up ${count} simulated devices...\n`);

  const devices = Array.from(
    { length: count },
    () => new SimulatedDevice(params, serializedParams),
  );
  await Promise.all(devices.map((d) => d.start()));

  console.log(`\nAll ${count} devices running. Press Ctrl+C to stop.`);
}

main().catch((error) => {
  console.error("Simulator failed to start:", error);
  process.exit(1);
});