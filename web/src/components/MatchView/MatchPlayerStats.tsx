import type { PlayerMatchStats } from "../../types";

const COLS: { key: keyof PlayerMatchStats; label: string }[] = [
  { key: "minutes", label: "Min" },
  { key: "goals", label: "G" },
  { key: "assists", label: "A" },
  { key: "shots", label: "Sh" },
  { key: "shotsOnTarget", label: "SoT" },
  { key: "fouls", label: "F" },
  { key: "rating", label: "Rate" },
];

function TeamTable({
  title,
  players,
  onSelectPlayer,
}: {
  title: string;
  players: PlayerMatchStats[];
  onSelectPlayer: (playerId: number) => void;
}) {
  const sorted = [...players].sort((a, b) => b.minutes - a.minutes);
  return (
    <div style={{ flex: "1 1 320px", minWidth: 0, borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) repeat(7,32px)", gap: 6, padding: "10px 12px", borderBottom: "1px solid var(--color-divider)" }}>
        <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-500)" }}>{title}</span>
        {COLS.map((c) => (
          <span key={c.key} style={{ fontSize: 10, color: "var(--color-neutral-600)", textAlign: "right" }}>
            {c.label}
          </span>
        ))}
      </div>
      {sorted.map((p) => (
        <div
          key={p.id}
          className="tl-player-clickable"
          onClick={() => onSelectPlayer(p.id)}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.6fr) repeat(7,32px)",
            gap: 6,
            padding: "8px 12px",
            borderBottom: "1px solid var(--color-divider)",
            alignItems: "center",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span className="tl-player-name" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {p.number != null ? `${p.number}. ` : ""}
            {p.name}
          </span>
          <span style={{ fontSize: 12, textAlign: "right", color: "var(--color-neutral-400)" }}>{p.minutes || "—"}</span>
          <span style={{ fontSize: 12, textAlign: "right" }}>{p.goals}</span>
          <span style={{ fontSize: 12, textAlign: "right" }}>{p.assists}</span>
          <span style={{ fontSize: 12, textAlign: "right", color: "var(--color-neutral-400)" }}>{p.shots}</span>
          <span style={{ fontSize: 12, textAlign: "right" }}>{p.shotsOnTarget}</span>
          <span style={{ fontSize: 12, textAlign: "right", color: "var(--color-neutral-400)" }}>{p.fouls}</span>
          <span style={{ fontSize: 12, textAlign: "right", color: "var(--color-accent-300)" }}>{p.rating?.toFixed(1) ?? "—"}</span>
        </div>
      ))}
      {sorted.length === 0 && (
        <div style={{ padding: 16 }}>
          <p className="text-muted" style={{ fontSize: 12 }}>No player stats recorded yet.</p>
        </div>
      )}
    </div>
  );
}

export function MatchPlayerStats({
  homeName,
  awayName,
  homeTeamId,
  awayTeamId,
  players,
  onSelectPlayer,
}: {
  homeName: string;
  awayName: string;
  homeTeamId: number;
  awayTeamId: number;
  players: PlayerMatchStats[];
  onSelectPlayer: (playerId: number) => void;
}) {
  return (
    <div>
      <h4 style={{ margin: "0 0 10px" }}>Player stats</h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <TeamTable title={homeName} players={players.filter((p) => p.teamId === homeTeamId)} onSelectPlayer={onSelectPlayer} />
        <TeamTable title={awayName} players={players.filter((p) => p.teamId === awayTeamId)} onSelectPlayer={onSelectPlayer} />
      </div>
    </div>
  );
}
