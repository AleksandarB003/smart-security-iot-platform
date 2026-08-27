export type DeviceTypeName = "MOTION" | "DOOR" | "SMOKE" | "CAMERA" | "GLASS_BREAK";

export interface EventDefinition {
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  weight: number;
}

export interface DeviceTypeConfig {
  type: DeviceTypeName;
  namePrefix: string;
  batteryPowered: boolean;
  events: EventDefinition[];
}

export const DEVICE_TYPES: DeviceTypeConfig[] = [
  {
    type: "MOTION",
    namePrefix: "Senzor pokreta",
    batteryPowered: true,
    events: [{ type: "motion_detected", severity: "INFO", weight: 1 }],
  },
  {
    type: "DOOR",
    namePrefix: "Senzor vrata",
    batteryPowered: true,
    events: [
      { type: "door_opened", severity: "INFO", weight: 1 },
      { type: "door_closed", severity: "INFO", weight: 1 },
    ],
  },
  {
    type: "SMOKE",
    namePrefix: "Senzor dima",
    batteryPowered: true,
    events: [{ type: "smoke_detected", severity: "CRITICAL", weight: 1 }],
  },
  {
    type: "CAMERA",
    namePrefix: "Kamera",
    batteryPowered: false,
    events: [
      { type: "motion_in_frame", severity: "INFO", weight: 2 },
      { type: "recording_started", severity: "INFO", weight: 1 },
    ],
  },
  {
    type: "GLASS_BREAK",
    namePrefix: "Senzor loma stakla",
    batteryPowered: true,
    events: [{ type: "glass_break_detected", severity: "CRITICAL", weight: 1 }],
  },
];

export function pickRandomDeviceType(): DeviceTypeConfig {
  return DEVICE_TYPES[Math.floor(Math.random() * DEVICE_TYPES.length)];
}

export function pickWeightedEvent(config: DeviceTypeConfig): EventDefinition {
  const total = config.events.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * total;
  for (const event of config.events) {
    if (roll < event.weight) return event;
    roll -= event.weight;
  }
  return config.events[config.events.length - 1];
}