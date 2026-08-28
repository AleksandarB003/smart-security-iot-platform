import { generateKeyPair, prove } from "schnorr-zkp-toolkit";
import type { PublicParams, KeyPair } from "schnorr-zkp-toolkit";
import { serializeParams, type SerializedParams } from "./serialization.js";
import {
  registerDevice,
  authenticateDevice,
  sendEvent,
  sendTelemetry,
  type RegisteredDevice,
} from "./apiClient.js";
import { pickRandomDeviceType, pickWeightedEvent, type DeviceTypeConfig } from "./deviceTypes.js";
import { pickRandomLocation } from "./locations.js";
import {
  TICK_INTERVAL_MS,
  EVENT_PROBABILITY,
  ARMED_TOGGLE_PROBABILITY,
  BATTERY_DRAIN_PER_TICK,
  TELEMETRY_INTERVAL_TICKS,
  SESSION_REFRESH_MARGIN_MS,
} from "./config.js";

export class SimulatedDevice {
  private typeConfig: DeviceTypeConfig;
  private keyPair!: KeyPair;
  private device!: RegisteredDevice;
  private sessionToken: string | null = null;
  private sessionExpiresAt = 0;
  private batteryLevel: number;
  private armed: boolean;
  private location: string;
  private tickCount = 0;
  private label: string;

  constructor(
    private params: PublicParams,
    private serializedParams: SerializedParams,
  ) {
    this.typeConfig = pickRandomDeviceType();
    this.location = pickRandomLocation();
    this.batteryLevel = this.typeConfig.batteryPowered ? 70 + Math.random() * 30 : 100;
    this.armed = Math.random() > 0.15; // most devices start armed
    this.label = `${this.typeConfig.namePrefix} – ${this.location}`;
  }

  async start(): Promise<void> {
    this.keyPair = generateKeyPair(this.params);

    this.device = await registerDevice(
      this.label,
      this.keyPair.publicKey.toString(),
      this.typeConfig.type,
      this.location,
      this.armed,
    );
    console.log(`[${this.label}] registered (id: ${this.device.id})`);

    await this.authenticate();
    setInterval(() => void this.tick(), TICK_INTERVAL_MS);
  }

  private async authenticate(): Promise<void> {
    const proof = prove(this.keyPair);
    const payload = {
      params: serializeParams(proof.params, this.serializedParams.bits),
      publicKey: proof.publicKey.toString(),
      commitment: proof.commitment.toString(),
      challenge: proof.challenge.toString(),
      response: proof.response.toString(),
    };

    const result = await authenticateDevice(this.device.id, payload);
    if (!result.success || !result.sessionToken || !result.sessionExpiresAt) {
      console.error(`[${this.label}] authentication failed`);
      return;
    }
    this.sessionToken = result.sessionToken;
    this.sessionExpiresAt = new Date(result.sessionExpiresAt).getTime();
    console.log(`[${this.label}] authenticated (session valid ~1h)`);
  }

  private async tick(): Promise<void> {
    this.tickCount += 1;

    if (Date.now() > this.sessionExpiresAt - SESSION_REFRESH_MARGIN_MS) {
      await this.authenticate();
    }
    if (!this.sessionToken) return;

    if (this.typeConfig.batteryPowered) {
      this.batteryLevel = Math.max(0, this.batteryLevel - BATTERY_DRAIN_PER_TICK);
    }
    if (Math.random() < ARMED_TOGGLE_PROBABILITY) {
      this.armed = !this.armed;
      console.log(`[${this.label}] ${this.armed ? "armed" : "disarmed"}`);
    }

    if (this.tickCount % TELEMETRY_INTERVAL_TICKS === 0) {
      await sendTelemetry(this.device.id, this.sessionToken, {
        batteryLevel: Math.round(this.batteryLevel),
        armed: this.armed,
      });
    }

    if (this.armed && this.batteryLevel > 0 && Math.random() < EVENT_PROBABILITY) {
      const event = pickWeightedEvent(this.typeConfig);
      const res = await sendEvent(
        this.device.id,
        this.sessionToken,
        event.type,
        event.severity,
        event.payload,
      );
      if (res.ok) {
        console.log(`[${this.label}] event: ${event.type} (${event.severity})`, event.payload);
      }
    }
  }
}