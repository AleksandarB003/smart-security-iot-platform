export function LocationFilter({
  locations,
  value,
  onChange,
}: {
  locations: string[];
  value: string;
  onChange: (location: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
      <option value="ALL">Sve lokacije</option>
      {locations.map((loc) => (
        <option key={loc} value={loc}>
          {loc}
        </option>
      ))}
    </select>
  );
}