import { SoccerBall, Cards, ArrowsLeftRight, Info } from "@phosphor-icons/react";
import type { MatchEvent } from "../../types";

const ICONS: Record<MatchEvent["type"], { Icon: typeof SoccerBall; tint: string }> = {
  goal: { Icon: SoccerBall, tint: "var(--color-accent-300)" },
  card: { Icon: Cards, tint: "var(--color-neutral-400)" },
  sub: { Icon: ArrowsLeftRight, tint: "var(--color-neutral-500)" },
  info: { Icon: Info, tint: "var(--color-neutral-600)" },
};

export function LiveFeed({ events, title = "Live feed" }: { events: MatchEvent[]; title?: string }) {
  const shown = [...events].reverse();
  return (
    <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-neutral-500)" }}>{title}</span>
        <span style={{ fontSize: 11, color: "var(--color-neutral-600)", fontVariantNumeric: "tabular-nums" }}>{events.length} events</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 308, overflowY: "auto" }}>
        {shown.length === 0 && <p className="text-muted" style={{ fontSize: 12 }}>No events yet.</p>}
        {shown.map((e, i) => {
          const { Icon, tint } = ICONS[e.type];
          return (
            <div
              key={i}
              className="tl-drop-in"
              style={{
                display: "grid",
                gridTemplateColumns: "34px 20px minmax(0,1fr)",
                gap: 8,
                alignItems: "start",
                padding: "9px 4px",
                borderBottom: "1px solid var(--color-divider)",
              }}
            >
              <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "var(--color-neutral-500)" }}>
                {e.minute}
                {e.extra ? `+${e.extra}` : ""}'
              </span>
              <Icon size={14} color={tint} />
              <span style={{ fontSize: 13, color: e.type === "goal" ? "var(--color-text)" : "var(--color-neutral-400)", lineHeight: 1.35 }}>
                {e.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
