import { useMemo, useState } from "react";
import { api } from "../api";
import { usePolling } from "../hooks/usePolling";
import type { RefereeSummary } from "../types";

type SortKey = "name" | "matches" | "yellow" | "red" | "penalties" | "avg";

const COLS: { key: SortKey; label: string; width: string; numeric: boolean }[] = [
  { key: "name", label: "Referee", width: "minmax(140px,1.6fr)", numeric: false },
  { key: "matches", label: "Matches", width: "70px", numeric: true },
  { key: "yellow", label: "Yellow", width: "60px", numeric: true },
  { key: "red", label: "Red", width: "50px", numeric: true },
  { key: "penalties", label: "Pens", width: "50px", numeric: true },
  { key: "avg", label: "Cards/match", width: "90px", numeric: true },
];

function metric(r: RefereeSummary, key: SortKey): number | string {
  switch (key) {
    case "name":
      return r.name;
    case "matches":
      return r.matches;
    case "yellow":
      return r.yellowCards;
    case "red":
      return r.redCards;
    case "penalties":
      return r.penalties;
    case "avg":
      return r.avgCardsPerMatch;
  }
}

export function RefereesView({ onSelectReferee }: { onSelectReferee: (name: string) => void }) {
  const [sortKey, setSortKey] = useState<SortKey>("matches");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const { data: referees, loading, error } = usePolling(() => api.referees(40), 5 * 60_000, []);

  const sorted = useMemo(() => {
    return [...(referees ?? [])].sort((a, b) => {
      const av = metric(a, sortKey);
      const bv = metric(b, sortKey);
      if (sortKey === "name") return (av as string).localeCompare(bv as string) * (sortDir === -1 ? -1 : 1);
      return ((bv as number) - (av as number)) * (sortDir === -1 ? 1 : -1) || a.name.localeCompare(b.name);
    });
  }, [referees, sortKey, sortDir]);

  const totals = (referees ?? []).reduce(
    (t, r) => ({ matches: t.matches + r.matches, yellow: t.yellow + r.yellowCards, red: t.red + r.redCards, penalties: t.penalties + r.penalties }),
    { matches: 0, yellow: 0, red: 0, penalties: 0 }
  );

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (-d as 1 | -1));
    else {
      setSortKey(key);
      setSortDir(-1);
    }
  };

  const gridTemplate = COLS.map((c) => c.width).join(" ");

  return (
    <div className="tl-fade-in" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 28px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-8)", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 44, margin: "0 0 6px" }}>Referees</h1>
          <p className="text-muted" style={{ margin: 0, maxWidth: "56ch" }}>
            Discipline record across recent Champions League fixtures, tallied from cards and penalty
            decisions in each match.
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)", justifyContent: "flex-end" }}>
          {[
            { label: "Matches", v: totals.matches },
            { label: "Yellow cards", v: totals.yellow },
            { label: "Red cards", v: totals.red },
            { label: "Penalties", v: totals.penalties },
          ].map((t) => (
            <div key={t.label} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums" }}>{t.v}</div>
              <div style={{ fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--color-neutral-600)", whiteSpace: "nowrap" }}>
                {t.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--color-surface)", color: "var(--color-accent-300)", marginBottom: 16 }}>
          Couldn't load referee statistics: {error}
        </div>
      )}
      {loading && !referees && <p className="text-muted">Loading referees…</p>}

      <div style={{ borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: `30px ${gridTemplate}`, gap: "var(--space-2)", padding: "11px 14px", borderBottom: "1px solid var(--color-divider)" }}>
          <span style={{ fontSize: 10, color: "var(--color-neutral-700)" }}>#</span>
          {COLS.map((c) => (
            <button
              key={c.key}
              className="tl-sort-btn"
              onClick={() => toggleSort(c.key)}
              style={{ textAlign: c.numeric ? "right" : "left", color: sortKey === c.key ? "var(--color-accent-300)" : "var(--color-neutral-600)" }}
            >
              {c.label} {sortKey === c.key ? (sortDir === -1 ? "▼" : "▲") : ""}
            </button>
          ))}
        </div>
        {sorted.map((r, i) => (
          <div
            key={r.name}
            className="tl-stat-row tl-player-clickable"
            onClick={() => onSelectReferee(r.name)}
            style={{
              display: "grid",
              gridTemplateColumns: `30px ${gridTemplate}`,
              gap: "var(--space-2)",
              padding: "11px 14px",
              borderBottom: "1px solid var(--color-divider)",
              alignItems: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>{i + 1}</span>
            <span className="tl-player-name" style={{ fontFamily: "var(--font-heading)", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.name}
            </span>
            <span style={{ textAlign: "right", fontSize: 13, color: "var(--color-neutral-400)" }}>{r.matches}</span>
            <span style={{ textAlign: "right", fontSize: 14 }}>{r.yellowCards}</span>
            <span style={{ textAlign: "right", fontSize: 14, color: r.redCards > 0 ? "var(--color-accent-300)" : "var(--color-text)" }}>{r.redCards}</span>
            <span style={{ textAlign: "right", fontSize: 13, color: "var(--color-neutral-400)" }}>{r.penalties}</span>
            <span style={{ textAlign: "right", fontSize: 14, color: "var(--color-accent-300)" }}>{r.avgCardsPerMatch.toFixed(1)}</span>
          </div>
        ))}
        {!loading && sorted.length === 0 && (
          <div style={{ padding: 20 }}>
            <p className="text-muted">No referee data available yet — check back once more matches have been played.</p>
          </div>
        )}
      </div>
    </div>
  );
}
