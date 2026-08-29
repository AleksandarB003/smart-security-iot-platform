import type { SecurityEvent } from "../types";
import { EventRow } from "./EventRow";

export function EventFeed({ events, connected }: { events: SecurityEvent[]; connected: boolean }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-3)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: connected ? "var(--color-success)" : "var(--color-text-muted)",
            animation: connected ? "pulse 2s infinite" : "none",
          }}
        />
        <span
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-text-muted)" }}
        >
          {connected ? "LIVE" : "DISCONNECTED"}
        </span>
      </div>

      {events.length === 0 ? (
        <p
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
        >
          Čeka se prvi event...
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}