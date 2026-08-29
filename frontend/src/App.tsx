import { useCallback } from "react";
import { useDevices } from "./hooks/useDevices";
import { useLiveFeed } from "./hooks/useLiveFeed";
import { DeviceGrid } from "./components/DeviceGrid";
import { EventFeed } from "./components/EventFeed";
import type { Device } from "./types";

export default function App() {
  const { devices, setDevices, loading } = useDevices();

  const handleDeviceUpdate = useCallback(
    (updated: Device) => {
      setDevices((prev) => {
        const idx = prev.findIndex((d) => d.id === updated.id);
        if (idx === -1) return [updated, ...prev];
        const next = [...prev];
        next[idx] = updated;
        return next;
      });
    },
    [setDevices],
  );

  const { events, connected } = useLiveFeed(handleDeviceUpdate);

  return (
    <div style={{ padding: "var(--space-6)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-8)",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
          Smart Security IoT Platform
        </h1>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "var(--space-6)",
        }}
      >
        <section
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4)",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--color-text-muted)",
              margin: "0 0 var(--space-3) 0",
            }}
          >
            Uređaji {devices.length > 0 && `(${devices.length})`}
          </h2>
          {loading ? (
            <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
              Učitavanje...
            </p>
          ) : (
            <DeviceGrid devices={devices} />
          )}
        </section>

        <section
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4)",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--color-text-muted)",
              margin: "0 0 var(--space-3) 0",
            }}
          >
            Live feed
          </h2>
          <EventFeed events={events} connected={connected} />
        </section>
      </div>
    </div>
  );
}