import { fmtOdd } from "../lib/odds";

interface PriceCommon {
  odd: number | null;
  drift?: 1 | -1;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const driftColor = (d: 1 | -1 | undefined) =>
  d === 1 ? "var(--color-accent-400)" : d === -1 ? "var(--color-neutral-500)" : "transparent";
const driftMark = (d: 1 | -1 | undefined) => (d === 1 ? "▲" : d === -1 ? "▼" : "");

/** Compact odds pill used in the fixtures-list 1X2 grid. */
export function OddsPill({ odd, drift, selected, onClick, disabled }: PriceCommon) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || odd == null}
      style={{
        padding: "11px 4px",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${selected ? "var(--color-accent)" : "var(--color-neutral-800)"}`,
        background: selected ? "var(--color-accent-900)" : "transparent",
        color: selected ? "var(--color-accent-200)" : "var(--color-text)",
        fontFamily: "var(--font-heading)",
        fontSize: 16,
        fontVariantNumeric: "tabular-nums",
        cursor: odd == null ? "default" : "pointer",
        transition: "all 0.18s ease",
        position: "relative",
      }}
      className="tl-price-pill"
    >
      {fmtOdd(odd)}
      <span style={{ position: "absolute", top: 3, right: 5, fontSize: 9, color: driftColor(drift) }}>
        {driftMark(drift)}
      </span>
    </button>
  );
}

/** Labelled market price button used on the match hub's market cards. */
export function MarketPriceButton({ label, odd, drift, selected, onClick, disabled }: PriceCommon & { label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || odd == null}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "10px 8px",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${selected ? "var(--color-accent)" : "var(--color-neutral-800)"}`,
        background: selected ? "var(--color-accent-900)" : "transparent",
        cursor: odd == null ? "default" : "pointer",
        transition: "all 0.18s ease",
        textAlign: "left",
      }}
      className="tl-market-price"
    >
      <span
        style={{
          fontSize: 11,
          color: "var(--color-neutral-400)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontFamily: "var(--font-heading)",
          fontSize: 16,
          fontVariantNumeric: "tabular-nums",
          color: selected ? "var(--color-accent-200)" : "var(--color-text)",
        }}
      >
        {fmtOdd(odd)}
        <span style={{ fontSize: 9, color: driftColor(drift) }}>{driftMark(drift)}</span>
      </span>
    </button>
  );
}
