import { BASE_URL } from "./config.js";
import type { SerializedParams } from "./serialization.js";

export async function fetchPlatformParams(): Promise<SerializedParams> {
  const res = await fetch(`${BASE_URL}/api/zkp/params`);
  if (!res.ok) throw new Error(`Failed to fetch params: ${res.status}`);
  return res.json();
}

export interface RegisteredDevice {
  id: string;
  name: string;
  type: string;
  publicKey: string;
  status: string;
  batteryLevel: number;
  armed: boolean;
}

export async function registerDevice(
  name: string,
  publicKey: string,
  type: string,
  armed: boolean,
): Promise<RegisteredDevice> {
  const res = await fetch(`${BASE_URL}/api/devices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, publicKey, type, armed }),
  });
  if (!res.ok) {
    throw new Error(`Failed to register device: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export interface AuthResponse {
  success: boolean;
  sessionToken?: string;
  sessionExpiresAt?: string;
}

export async function authenticateDevice(
  deviceId: string,
  proofPayload: unknown,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/devices/${deviceId}/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proofPayload),
  });
  return res.json();
}

export function sendEvent(
  deviceId: string,
  token: string,
  type: string,
  severity: string,
): Promise<Response> {
  return fetch(`${BASE_URL}/api/devices/${deviceId}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type, severity }),
  });
}

export function sendTelemetry(
  deviceId: string,
  token: string,
  data: { batteryLevel?: number; armed?: boolean },
): Promise<Response> {
  return fetch(`${BASE_URL}/api/devices/${deviceId}/telemetry`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}