import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { useDevices } from "./hooks/useDevices";
import { useLiveFeed } from "./hooks/useLiveFeed";
import { DeviceGrid } from "./components/DeviceGrid";
import { EventFeed } from "./components/EventFeed";
import { SeverityFilter } from "./components/SeverityFilter";
import { SortControl, type SortKey } from "./components/SortControl";
import { LocationFilter } from "./components/LocationFilter";
import { DeviceModal } from "./components/DeviceModal";
import type { Device, Severity } from "./types";

function sortDevices(devices: Device[], key: SortKey): Device[] {
  const sorted = [...devices];
  switch (key) {
    case "location":
      return sorted.sort((a, b) => a.location.localeCompare(b.location));
    case "status":
      return sorted.sort((a, b) => a.status.localeCompare(b.status));
    case "battery":
      return sorted.sort((a, b) => a.batteryLevel - b.batteryLevel);
    case "type":
      return sorted.sort((a, b) => a.type.localeCompare(b.type));
    default:
      return sorted;
  }
}

function groupByLocation(devices: Device[]): [string, Device[]][] {
  const map = new Map<string, Device[]>();
  for (const device of devices) {
    const list = map.get(device.location) ?? [];
    list.push(device);
    map.set(device.location, list);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

const panelHeaderStyle: CSSProperties = {
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-muted)",
  margin: 0,
};

export default function App() {
  const { devices, setDevices, loading } = useDevices();
  const [sortKey, setSortKey] = useState<SortKey>("location");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [grouped, setGrouped] = useState(false);
  const [activeSeverities, setActiveSeverities] = useState<Set<Severity>>(
    new Set(["INFO", "WARNING", "CRITICAL"]),
  );
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

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

  const uniqueLocations = useMemo(
    () => [...new Set(devices.map((d) => d.location))].sort(),
    [devices],
  );

  const locationFilteredDevices = useMemo(
    () => (locationFilter === "ALL" ? devices : devices.filter((d) => d.location === locationFilter)),
    [devices, locationFilter],
  );

  const sortedDevices = useMemo(
    () => sortDevices(locationFilteredDevices, sortKey),
    [locationFilteredDevices, sortKey],
  );

  const groupedDevices = useMemo(
    () => (grouped ? groupByLocation(sortedDevices) : null),
    [grouped, sortedDevices],
  );

  const filteredEvents = useMemo(
    () => events.filter((event) => activeSeverities.has(event.severity)),
    [events, activeSeverities],
  );

  const toggleSeverity = (severity: Severity) => {
    setActiveSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(severity)) {
        next.delete(severity);
      } else {
        next.add(severity);
      }
      return next;
    });
  };

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-2)",
              marginBottom: "var(--space-3)",
            }}
          >
            <h2 style={panelHeaderStyle}>Uređaji {devices.length > 0 && `(${devices.length})`}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <LocationFilter
                locations={uniqueLocations}
                value={locationFilter}
                onChange={setLocationFilter}
              />
              <SortControl value={sortKey} onChange={setSortKey} />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={grouped}
                  onChange={(e) => setGrouped(e.target.checked)}
                />
                Grupiši
              </label>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
              Učitavanje...
            </p>
          ) : groupedDevices ? (
            groupedDevices.map(([location, group]) => (
              <div key={location} style={{ marginBottom: "var(--space-4)" }}>
                <h3
                  style={{
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-muted)",
                    margin: "0 0 var(--space-2) 0",
                  }}
                >
                  {location} ({group.length})
                </h3>
                <DeviceGrid devices={group} onDeviceClick={setSelectedDevice} />
              </div>
            ))
          ) : (
            <DeviceGrid devices={sortedDevices} onDeviceClick={setSelectedDevice} />
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-3)",
            }}
          >
            <h2 style={panelHeaderStyle}>Live feed</h2>
            <SeverityFilter active={activeSeverities} onToggle={toggleSeverity} />
          </div>
          <EventFeed events={filteredEvents} connected={connected} />
        </section>
      </div>

      {selectedDevice && (
        <DeviceModal device={selectedDevice} onClose={() => setSelectedDevice(null)} />
      )}
    </div>
  );
}