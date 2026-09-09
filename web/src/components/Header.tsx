import { Receipt } from "@phosphor-icons/react";
import { useBetSlip } from "../state/BetSlipContext";
import { PlayerSearch } from "./PlayerSearch";
import type { View } from "../App";

export function Header({
  view,
  onNavigate,
  roundLabel,
  onSelectPlayer,
}: {
  view: View;
  onNavigate: (v: "fixtures" | "stats") => void;
  roundLabel: string;
  onSelectPlayer: (playerId: number) => void;
}) {
  const { slip, toggleSlip } = useBetSlip();
  const tabs: { key: "fixtures" | "stats"; label: string }[] = [
    { key: "fixtures", label: "Matches" },
    { key: "stats", label: "Statistics" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-6)",
        padding: "14px 28px",
        borderBottom: "1px solid var(--color-divider)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(12px)",
        background: "color-mix(in srgb, var(--color-bg) 82%, transparent)",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={() => onNavigate("fixtures")}
      >
        <div
          style={{
            width: 22,
            height: 22,
            border: "1px solid var(--color-accent)",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-accent)",
              boxShadow: "0 0 12px var(--color-accent)",
            }}
          />
        </div>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Touchline
        </span>
      </div>

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        {tabs.map((t) => {
          const active = view === t.key || (t.key === "fixtures" && view === "match");
          return (
            <button
              key={t.key}
              className="tl-nav-tab"
              onClick={() => onNavigate(t.key)}
              style={{
                color: active ? "var(--color-text)" : "var(--color-neutral-500)",
                borderBottomColor: active ? "var(--color-accent)" : "transparent",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <PlayerSearch onSelect={onSelectPlayer} />

      <span style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-neutral-500)" }}>
        {roundLabel}
      </span>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-neutral-400)" }}>
        <span className="tl-pulse-dot" />
        <span>Odds live</span>
      </div>
      <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={toggleSlip}>
        <Receipt size={15} weight="regular" />
        <span>Bet slip</span>
        <span
          style={{
            minWidth: 20,
            padding: "0 6px",
            borderRadius: 20,
            background: "var(--color-accent-800)",
            color: "var(--color-accent-200)",
            fontSize: 12,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {slip.length}
        </span>
      </button>
    </div>
  );
}
