export type SortKey = "location" | "status" | "battery" | "type";

export function SortControl({ value, onChange }: { value: SortKey; onChange: (key: SortKey) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
      style={{
        background: "var(--color-surface-elevated)",
        color: "var(--color-text)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        padding: "4px 8px",
      }}
    >
      <option value="location">Lokacija</option>
      <option value="status">Status</option>
      <option value="battery">Baterija</option>
      <option value="type">Tip</option>
    </select>
  );
}