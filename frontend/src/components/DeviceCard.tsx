import { Activity, DoorOpen, Flame, Camera, ShieldAlert } from "lucide-react";
import type { Device } from "../types";
import { StatusBadge } from "./StatusBadge";
import { BatteryBar } from "./BatteryBar";

const TYPE_ICONS = {
  MOTION: Activity,
  DOOR: DoorOpen,
  SMOKE: Flame,
  CAMERA: Camera,
  GLASS_BREAK: ShieldAlert,
};

export function DeviceCard({ device, onClick }: { device: Device; onClick?: () => void }) {
  const Icon = TYPE_ICONS[device.type];

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <Icon size={16} color="var(--color-accent)" />
        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{device.location}</span>
      </div>

      <div
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-text-muted)" }}
      >
        {device.id.slice(0, 8)}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StatusBadge status={device.status} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: device.armed ? "var(--color-warning)" : "var(--color-text-muted)",
          }}
        >
          {device.armed ? "ARMED" : "DISARMED"}
        </span>
      </div>

      {device.type !== "CAMERA" && <BatteryBar level={device.batteryLevel} />}
    </div>
  );
}