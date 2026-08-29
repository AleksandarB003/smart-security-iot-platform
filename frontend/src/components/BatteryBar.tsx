function batteryColor(level: number): string {
  if (level <= 15) return "var(--color-critical)";
  if (level <= 40) return "var(--color-warning)";
  return "var(--color-success)";
}

export function BatteryBar({ level }: { level: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
      <div
        style={{
          flex: 1,
          height: 4,
          background: "var(--color-border)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${level}%`,
            height: "100%",
            background: batteryColor(level),
            transition: "width 300ms ease",
          }}
        />
      </div>
      <span
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-text-muted)" }}
      >
        {Math.round(level)}%
      </span>
    </div>
  );
}