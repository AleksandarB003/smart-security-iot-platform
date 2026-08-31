import type { Severity } from "../types";

const SEVERITIES: Severity[] = ["INFO", "WARNING", "CRITICAL"];

const SEVERITY_COLORS: Record<Severity, string> = {
  INFO: "var(--color-accent)",
  WARNING: "var(--color-warning)",
  CRITICAL: "var(--color-critical)",
};

export function SeverityFilter({
  active,
  onToggle,
}: {
  active: Set<Severity>;
  onToggle: (severity: Severity) => void;
}) {
  return (
    <div style={{ display: "flex", gap: "var(--space-2)" }}>
      {SEVERITIES.map((severity) => {
        const isActive = active.has(severity);
        const color = SEVERITY_COLORS[severity];
        return (
          <button
            key={severity}
            onClick={() => onToggle(severity)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${color}`,
              background: isActive ? color : "transparent",
              color: isActive ? "var(--color-canvas)" : color,
              cursor: "pointer",
              opacity: isActive ? 1 : 0.6,
            }}
          >
            {severity}
          </button>
        );
      })}
    </div>
  );
}