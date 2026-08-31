import type { Device } from "../types";
import { DeviceCard } from "./DeviceCard";

export function DeviceGrid({
  devices,
  onDeviceClick,
}: {
  devices: Device[];
  onDeviceClick?: (device: Device) => void;
}) {
  if (devices.length === 0) {
    return (
      <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
        Nema registrovanih uređaja.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "var(--space-3)",
      }}
    >
      {devices.map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          onClick={onDeviceClick ? () => onDeviceClick(device) : undefined}
        />
      ))}
    </div>
  );
}