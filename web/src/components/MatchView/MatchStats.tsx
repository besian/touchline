import type { StatPair } from "../../types";

export function MatchStats({ stats }: { stats: StatPair[] }) {
  return (
    <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-neutral-500)", marginBottom: 12 }}>
        Match stats
      </div>
      {stats.length === 0 && <p className="text-muted" style={{ fontSize: 12 }}>Not available yet.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {stats.map((s) => {
          const total = s.home + s.away || 1;
          return (
            <div key={s.label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontVariantNumeric: "tabular-nums", marginBottom: 5 }}>
                <span>{s.label === "Possession" ? `${s.home}%` : s.home}</span>
                <span style={{ color: "var(--color-neutral-500)" }}>{s.label}</span>
                <span>{s.label === "Possession" ? `${s.away}%` : s.away}</span>
              </div>
              <div style={{ display: "flex", height: 4, gap: 2 }}>
                <div style={{ flex: s.home / total, background: "var(--color-accent-500)", borderRadius: 20, transition: "flex-grow 0.8s ease" }} />
                <div style={{ flex: s.away / total, background: "var(--color-neutral-700)", borderRadius: 20, transition: "flex-grow 0.8s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
