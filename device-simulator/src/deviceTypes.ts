export type DeviceTypeName = "MOTION" | "DOOR" | "SMOKE" | "CAMERA" | "GLASS_BREAK";
export type Severity = "INFO" | "WARNING" | "CRITICAL";

export interface GeneratedEvent {
  type: string;
  severity: Severity;
  payload: Record<string, unknown>;
}

interface EventGenerator {
  weight: number;
  generate: () => GeneratedEvent;
}

export interface DeviceTypeConfig {
  type: DeviceTypeName;
  namePrefix: string;
  batteryPowered: boolean;
  eventGenerators: EventGenerator[];
}

function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function weightedPick<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    if (roll < item.weight) return item.value;
    roll -= item.weight;
  }
  return items[items.length - 1].value;
}

const MOTION_ZONES = ["ulaz", "centar prostorije", "levi ugao", "desni ugao", "prozor"];

const CAMERA_OBJECT_OPTIONS: { value: string[]; weight: number }[] = [
  { value: ["person"], weight: 3 },
  { value: ["vehicle"], weight: 2 },
  { value: ["animal"], weight: 2 },
  { value: ["package"], weight: 1 },
];

export const DEVICE_TYPES: DeviceTypeConfig[] = [
  {
    type: "MOTION",
    namePrefix: "Senzor pokreta",
    batteryPowered: true,
    eventGenerators: [
      {
        weight: 1,
        generate: () => ({
          type: "motion_detected",
          severity: "INFO",
          payload: {
            confidence: randomInt(55, 99),
            zone: MOTION_ZONES[randomInt(0, MOTION_ZONES.length - 1)],
          },
        }),
      },
    ],
  },
  {
    type: "DOOR",
    namePrefix: "Senzor vrata",
    batteryPowered: true,
    eventGenerators: [
      {
        weight: 2,
        generate: () => ({
          type: "door_opened",
          severity: "INFO",
          payload: { forceDetected: false },
        }),
      },
      {
        weight: 2,
        generate: () => ({
          type: "door_closed",
          severity: "INFO",
          payload: { openDurationSec: randomInt(3, 240) },
        }),
      },
      {
        weight: 0.15,
        generate: () => ({
          type: "door_opened",
          severity: "CRITICAL",
          payload: { forceDetected: true },
        }),
      },
    ],
  },
  {
    type: "SMOKE",
    namePrefix: "Senzor dima",
    batteryPowered: true,
    eventGenerators: [
      {
        weight: 1,
        generate: () => {
          const ppm = randomInt(80, 450);
          return {
            type: "smoke_detected",
            severity: ppm >= 200 ? "CRITICAL" : "WARNING",
            payload: { ppm, temperatureC: randomInt(22, 45) },
          };
        },
      },
    ],
  },
  {
    type: "CAMERA",
    namePrefix: "Kamera",
    batteryPowered: false,
    eventGenerators: [
      {
        weight: 1,
        generate: () => {
          const objects = weightedPick(CAMERA_OBJECT_OPTIONS);
          return {
            type: "motion_in_frame",
            severity: objects.includes("person") ? "WARNING" : "INFO",
            payload: {
              objectsDetected: objects,
              confidence: randomInt(70, 99),
              clipDurationSec: randomInt(5, 30),
            },
          };
        },
      },
    ],
  },
  {
    type: "GLASS_BREAK",
    namePrefix: "Senzor loma stakla",
    batteryPowered: true,
    eventGenerators: [
      {
        weight: 1,
        generate: () => {
          const matchConfidence = randomInt(45, 99);
          return {
            type: "glass_break_detected",
            severity: matchConfidence >= 70 ? "CRITICAL" : "WARNING",
            payload: { decibels: randomInt(85, 120), matchConfidence },
          };
        },
      },
    ],
  },
];

export function pickRandomDeviceType(): DeviceTypeConfig {
  return DEVICE_TYPES[randomInt(0, DEVICE_TYPES.length - 1)];
}

export function pickWeightedEvent(config: DeviceTypeConfig): GeneratedEvent {
  const generator = weightedPick(config.eventGenerators.map((g) => ({ value: g, weight: g.weight })));
  return generator.generate();
}