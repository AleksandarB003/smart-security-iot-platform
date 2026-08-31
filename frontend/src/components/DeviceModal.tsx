import { useEffect, useState } from "react";
import type { Device, SecurityEvent, ProofLogEntry } from "../types";
import { API_URL } from "../api";
import { StatusBadge } from "./StatusBadge";
import { BatteryBar } from "./BatteryBar";

export function DeviceModal({ device, onClose }: { device: Device; onClose: () => void }) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [proofLogs, setProofLogs] = useState<ProofLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/devices/${device.id}/events?limit=10`).then((r) => r.json()),
      fetch(`${API_URL}/api/devices/${device.id}/proof-logs?limit=10`).then((r) => r.json()),
    ])
      .then(([eventsData, proofData]) => {
        setEvents(eventsData);
        setProofLogs(proofData);
      })
      .finally(() => setLoading(false));
  }, [device.id]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-6)",
          width: "min(480px, 90vw)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{device.location}</h2>
            <p
              style={{
                margin: "4px 0 0",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
              }}
            >
              {device.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "1.2rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", margin: "var(--space-4) 0" }}>
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

        {device.type !== "CAMERA" && (
          <div style={{ marginBottom: "var(--space-4)" }}>
            <BatteryBar level={device.batteryLevel} />
          </div>
        )}

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-4)",
          }}
        >
          ID: {device.id}
          <br />
          Javni ključ: {device.publicKey.slice(0, 20)}...
        </div>

        {loading ? (
          <p style={{ color: "var(--color-text-muted)" }}>Učitavanje...</p>
        ) : (
          <>
            <h3
              style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}
            >
              ZKP istorija ({proofLogs.length})
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-1)",
                marginBottom: "var(--space-4)",
              }}
            >
              {proofLogs.length === 0 && (
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                  }}
                >
                  Nema pokušaja.
                </p>
              )}
              {proofLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <span style={{ color: log.success ? "var(--color-success)" : "var(--color-critical)" }}>
                    {log.success ? "OK" : "FAIL"}
                  </span>
                  <span>{log.commitment.slice(0, 12)}...</span>
                  <span>{new Date(log.createdAt).toLocaleTimeString("sr-RS", { hour12: false })}</span>
                </div>
              ))}
            </div>

            <h3
              style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)" }}
            >
              Poslednji eventi ({events.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              {events.length === 0 && (
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                  }}
                >
                  Nema eventa.
                </p>
              )}
              {events.map((event) => (
                <div
                  key={event.id}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-text)" }}
                >
                  {new Date(event.createdAt).toLocaleTimeString("sr-RS", { hour12: false })} {event.type}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}