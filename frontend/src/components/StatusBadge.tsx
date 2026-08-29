const STATUS_COLORS: Record<string, string> = {
  PENDING: "var(--color-text-muted)",
  ACTIVE: "var(--color-success)",
  REVOKED: "var(--color-critical)",
};

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "var(--color-text-muted)";
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        color,
        border: `1px solid ${color}`,
        borderRadius: "var(--radius-sm)",
        padding: "2px 6px",
      }}
    >
      {status}
    </span>
  );
}