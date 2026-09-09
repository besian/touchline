import type { LineupPlayer, PlayerMatchStats } from "../../types";
import type { TokenPos } from "../../lib/formation";

export function HoverCard({ player, pos, stats }: { player: LineupPlayer; pos: TokenPos; stats: PlayerMatchStats | undefined }) {
  return (
    <div
      className="tl-fade-in"
      style={{
        position: "absolute",
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%,-118%)",
        minWidth: 180,
        padding: "11px 13px",
        borderRadius: "var(--radius-md)",
        background: "#111320",
        boxShadow: "var(--shadow-lg)",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, marginBottom: 2 }}>{player.name}</div>
      <div style={{ fontSize: 11, color: "var(--color-neutral-500)", marginBottom: 9 }}>
        {player.position} · #{player.number}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums", color: "var(--color-accent-300)" }}>
            {stats?.rating?.toFixed(1) ?? "—"}
          </div>
          <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>rating</div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums" }}>{stats?.minutes ?? "—"}</div>
          <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>mins</div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums" }}>
            {stats?.passAccuracy != null ? `${stats.passAccuracy}%` : "—"}
          </div>
          <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>pass</div>
        </div>
      </div>
      <div
        style={{
          marginTop: 9,
          paddingTop: 8,
          borderTop: "1px solid var(--color-divider)",
          fontSize: 10,
          color: "var(--color-neutral-500)",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {stats
          ? `This match: ${stats.goals}G · ${stats.assists}A · ${stats.shots} shots (${stats.shotsOnTarget} on target) · ${stats.fouls} fouls`
          : "No stats recorded yet"}
      </div>
    </div>
  );
}
