import { useMemo, useState } from "react";
import { api } from "../api";
import { usePolling } from "../hooks/usePolling";
import { TeamCrest } from "./TeamCrest";
import type { PlayerSeasonStats } from "../types";

type SortKey = "name" | "mins" | "g" | "a" | "sh" | "sot" | "f" | "rating";

const COLS: { key: SortKey; label: string; width: string; numeric: boolean }[] = [
  { key: "name", label: "Player", width: "minmax(112px,1.6fr)", numeric: false },
  { key: "mins", label: "Min", width: "44px", numeric: true },
  { key: "g", label: "G", width: "30px", numeric: true },
  { key: "a", label: "A", width: "30px", numeric: true },
  { key: "sh", label: "Sh", width: "34px", numeric: true },
  { key: "sot", label: "SoT", width: "62px", numeric: true },
  { key: "f", label: "Fouls", width: "40px", numeric: true },
  { key: "rating", label: "Rate", width: "42px", numeric: true },
];

function metric(p: PlayerSeasonStats, key: SortKey): number | string {
  switch (key) {
    case "name":
      return p.name;
    case "mins":
      return p.minutes;
    case "g":
      return p.goals;
    case "a":
      return p.assists;
    case "sh":
      return p.shots;
    case "sot":
      return p.shotsOnTarget;
    case "f":
      return p.fouls;
    case "rating":
      return p.rating ?? 0;
  }
}

export function StatsView({
  onSelectPlayer,
  onSelectTeam,
}: {
  onSelectPlayer: (playerId: number) => void;
  onSelectTeam: (teamId: number) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("g");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [club, setClub] = useState<number | "all">("all");

  const { data: players, loading, error } = usePolling(() => api.players(4), 5 * 60_000, []);
  const { data: pastResults } = usePolling(() => api.pastResults(8), 5 * 60_000, []);

  const clubs = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of players ?? []) map.set(p.teamId, p.teamName);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [players]);

  const pool = useMemo(() => (players ?? []).filter((p) => club === "all" || p.teamId === club), [players, club]);

  const sorted = useMemo(() => {
    return [...pool]
      .sort((a, b) => {
        const av = metric(a, sortKey);
        const bv = metric(b, sortKey);
        if (sortKey === "name") return (av as string).localeCompare(bv as string) * (sortDir === -1 ? -1 : 1);
        return ((bv as number) - (av as number)) * (sortDir === -1 ? 1 : -1) || a.name.localeCompare(b.name);
      })
      .slice(0, 20);
  }, [pool, sortKey, sortDir]);

  const maxSort = Math.max(...sorted.map((r) => (sortKey === "name" ? 1 : (metric(r, sortKey) as number))), 1);

  const totals = pool.reduce(
    (t, r) => ({ g: t.g + r.goals, a: t.a + r.assists, sh: t.sh + r.shots, sot: t.sot + r.shotsOnTarget, f: t.f + r.fouls }),
    { g: 0, a: 0, sh: 0, sot: 0, f: 0 }
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
    <div className="tl-fade-in" style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 28px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-8)", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 44, margin: "0 0 6px" }}>Player statistics</h1>
          <p className="text-muted" style={{ margin: 0, maxWidth: "52ch" }}>
            Season to date. Click any column to re-rank — the bars follow whatever you sort by.
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)", justifyContent: "flex-end" }}>
          {[
            { label: "Goals", v: totals.g },
            { label: "Assists", v: totals.a },
            { label: "Shots", v: totals.sh },
            { label: "On target", v: totals.sot },
            { label: "Fouls", v: totals.f },
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
          Couldn't load player statistics: {error}
        </div>
      )}
      {loading && !players && <p className="text-muted">Loading statistics…</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
        <button
          className="tl-club-chip"
          onClick={() => setClub("all")}
          style={
            club === "all"
              ? { borderColor: "var(--color-accent)", background: "var(--color-accent-900)", color: "var(--color-accent-200)" }
              : undefined
          }
        >
          All clubs
        </button>
        {clubs.map(([id, name]) => (
          <button
            key={id}
            className="tl-club-chip"
            onClick={() => setClub(id)}
            style={
              club === id
                ? { borderColor: "var(--color-accent)", background: "var(--color-accent-900)", color: "var(--color-accent-200)" }
                : undefined
            }
          >
            {name}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-8)", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 540px", minWidth: 0, borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
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
          {sorted.map((r, i) => {
            const barWidth = sortKey === "name" ? 0 : (((metric(r, sortKey) as number) || 0) / maxSort) * 100;
            const accuracy = r.shots ? `${Math.round((r.shotsOnTarget / r.shots) * 100)}%` : "—";
            return (
              <div
                key={r.id}
                className="tl-stat-row tl-player-clickable"
                onClick={() => onSelectPlayer(r.id)}
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
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${barWidth}%`,
                    background: "linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent)",
                    transition: "width 0.6s cubic-bezier(.2,.8,.2,1)",
                    pointerEvents: "none",
                  }}
                />
                <span style={{ fontSize: 12, color: "var(--color-neutral-600)", position: "relative" }}>{i + 1}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, position: "relative" }}>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTeam(r.teamId);
                    }}
                  >
                    <TeamCrest id={r.teamId} logo="" name={r.teamName} size={16} />
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span
                      className="tl-player-name"
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 14,
                        color: i === 0 ? "var(--color-accent-300)" : "var(--color-text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.name}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--color-neutral-600)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.teamName} · {r.position}
                    </span>
                  </span>
                </div>
                <span style={{ textAlign: "right", fontSize: 13, color: "var(--color-neutral-400)", position: "relative" }}>{r.minutes}</span>
                <span style={{ textAlign: "right", fontSize: 14, position: "relative" }}>{r.goals}</span>
                <span style={{ textAlign: "right", fontSize: 14, position: "relative" }}>{r.assists}</span>
                <span style={{ textAlign: "right", fontSize: 13, color: "var(--color-neutral-400)", position: "relative" }}>{r.shots}</span>
                <span style={{ textAlign: "right", fontSize: 13, position: "relative" }}>
                  {r.shotsOnTarget}
                  <span style={{ fontSize: 9, color: "var(--color-neutral-600)" }}> {accuracy}</span>
                </span>
                <span style={{ textAlign: "right", fontSize: 13, color: "var(--color-neutral-400)", position: "relative" }}>{r.fouls}</span>
                <span style={{ textAlign: "right", fontSize: 14, color: "var(--color-accent-300)", position: "relative" }}>
                  {r.rating?.toFixed(1) ?? "—"}
                </span>
              </div>
            );
          })}
          {!loading && sorted.length === 0 && (
            <div style={{ padding: 20 }}>
              <p className="text-muted">No player statistics available for this filter yet.</p>
            </div>
          )}
        </div>

        <div style={{ flex: "1 1 300px", minWidth: 0, padding: 16, borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-neutral-500)" }}>Past results</span>
            <span style={{ fontSize: 10, color: "var(--color-neutral-600)" }}>Last {pastResults?.length ?? 0}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(pastResults ?? []).map((p) => (
              <div key={p.id} style={{ padding: "10px 4px", borderBottom: "1px solid var(--color-divider)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9, letterSpacing: "0.08em", color: "var(--color-neutral-700)", width: 24 }}>{p.round.replace(/^.*- /, "R")}</span>
                  <TeamCrest id={p.home.id} logo={p.home.logo} name={p.home.name} size={12} />
                  <span style={{ flex: 1, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.home.name}</span>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                    {p.goalsHome ?? 0} – {p.goalsAway ?? 0}
                  </span>
                  <span style={{ flex: 1, fontSize: 12, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.away.name}</span>
                  <TeamCrest id={p.away.id} logo={p.away.logo} name={p.away.name} size={12} />
                </div>
                <div style={{ marginTop: 4, paddingLeft: 32, fontSize: 10, color: "var(--color-neutral-600)" }}>{p.scorers || "No goals"}</div>
              </div>
            ))}
            {(pastResults ?? []).length === 0 && <p className="text-muted" style={{ fontSize: 12 }}>No past results yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

