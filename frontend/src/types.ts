export type DeviceType = "MOTION" | "DOOR" | "SMOKE" | "CAMERA" | "GLASS_BREAK";
export type DeviceStatus = "PENDING" | "ACTIVE" | "REVOKED";
export type Severity = "INFO" | "WARNING" | "CRITICAL";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  location: string;
  publicKey: string;
  status: DeviceStatus;
  batteryLevel: number;
  armed: boolean;
  registeredAt: string;
  lastSeenAt: string | null;
}

export interface ProofLogEntry {
  id: string;
  commitment: string;
  success: boolean;
  createdAt: string;
}

export interface SecurityEvent {
  id: string;
  deviceId: string;
  deviceName?: string;
  deviceLocation?: string;
  type: string;
  severity: Severity;
  payload: Record<string, unknown> | null;
  createdAt: string;
}