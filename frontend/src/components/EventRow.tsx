import type { SecurityEvent } from "../types";

const SEVERITY_COLORS: Record<string, string> = {
  INFO: "var(--color-accent)",
  WARNING: "var(--color-warning)",
  CRITICAL: "var(--color-critical)",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("sr-RS", { hour12: false });
}

function formatPayload(payload: Record<string, unknown> | null): string {
  if (!payload) return "";
  return Object.entries(payload)
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");
}

export function EventRow({ event }: { event: SecurityEvent }) {
  const color = SEVERITY_COLORS[event.severity] ?? "var(--color-text-muted)";

  return (
    <div
      style={{
        borderLeft: `2px solid ${color}`,
        padding: "var(--space-2) var(--space-3)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        animation: "fadeSlideIn 200ms ease",
      }}
    >
      <div style={{ display: "flex", gap: "var(--space-2)", color: "var(--color-text-muted)" }}>
        <span>{formatTime(event.createdAt)}</span>
        <span style={{ color }}>{event.severity}</span>
        <span>{event.deviceLocation}</span>
      </div>
      <div style={{ color: "var(--color-text)" }}>{event.type}</div>
      {event.payload && (
        <div style={{ color: "var(--color-text-muted)" }}>{formatPayload(event.payload)}</div>
      )}
    </div>
  );
}