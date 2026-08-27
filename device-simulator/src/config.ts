export const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

// Random device count range per simulator run
export const MIN_DEVICES = 5;
export const MAX_DEVICES = 15;

// How often each device "thinks" about doing something
export const TICK_INTERVAL_MS = 5000;

// Chance per tick that an armed, powered device fires an event
export const EVENT_PROBABILITY = 0.15;

// Chance per tick that a device flips armed/disarmed (demo variety)
export const ARMED_TOGGLE_PROBABILITY = 0.02;

// Battery drain per tick, battery-powered devices only (CAMERA is mains-powered)
export const BATTERY_DRAIN_PER_TICK = 0.2;

// Send a telemetry update (battery/armed) every N ticks, not every tick
export const TELEMETRY_INTERVAL_TICKS = 4;

// Re-authenticate this long before the session token actually expires
export const SESSION_REFRESH_MARGIN_MS = 5 * 60 * 1000;