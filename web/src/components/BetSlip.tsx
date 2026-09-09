import { Receipt, X } from "@phosphor-icons/react";
import { useBetSlip } from "../state/BetSlipContext";

export function BetSlip() {
  const { slip, slipOpen, toggleSlip, stake, setStake, removePick, place } = useBetSlip();

  const combo = slip.reduce((a, x) => a * x.odds, 1);
  const stakeNum = parseFloat(stake) || 0;
  const payout = slip.length ? stakeNum * combo : 0;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: 352,
        zIndex: 80,
        background: "#12141f",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.5), inset 1px 0 0 var(--color-neutral-800)",
        transform: `translateX(${slipOpen ? "0px" : "352px"})`,
        transition: "transform 0.42s cubic-bezier(.2,.85,.2,1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          borderBottom: "1px solid var(--color-divider)",
        }}
      >
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>Bet slip</span>
        <button className="btn btn-icon" onClick={toggleSlip} aria-label="Close slip">
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {slip.length === 0 && (
          <div style={{ marginTop: 60, textAlign: "center", color: "var(--color-neutral-600)" }}>
            <Receipt size={30} />
            <p style={{ marginTop: 10, fontSize: 13 }}>
              No selections yet.
              <br />
              Tap any price to build a bet.
            </p>
          </div>
        )}
        {slip.map((s) => (
          <div
            key={s.key}
            className="tl-drop-in"
            style={{
              padding: 12,
              borderRadius: "var(--radius-sm)",
              background: "var(--color-surface)",
              boxShadow: "var(--shadow-sm)",
              position: "relative",
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 3 }}>
              {s.market}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ flex: 1, fontFamily: "var(--font-heading)", fontSize: 14 }}>{s.label}</span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontVariantNumeric: "tabular-nums", color: "var(--color-accent-300)" }}>
                {s.odds.toFixed(2)}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-neutral-600)", marginTop: 3 }}>{s.match}</div>
            <button
              className="tl-remove-pick"
              onClick={() => removePick(s.key)}
              aria-label="Remove"
              style={{ position: "absolute", top: 8, right: 8 }}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px 20px", borderTop: "1px solid var(--color-divider)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[5, 10, 25, 100].map((v) => (
            <button key={v} className="tl-quick-stake" onClick={() => setStake(String(v))}>
              €{v}
            </button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="tl-stake">Stake</label>
          <input
            className="input"
            id="tl-stake"
            inputMode="decimal"
            value={stake}
            onChange={(e) => setStake(e.target.value.replace(/[^0-9.]/g, ""))}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-neutral-400)" }}>
          <span>{slip.length === 1 ? "Single" : `${slip.length} legs`} · combined odds</span>
          <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-text)" }}>{slip.length ? combo.toFixed(2) : "—"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-neutral-500)" }}>Payout</span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontVariantNumeric: "tabular-nums", color: "var(--color-accent-300)" }}>
            €{payout.toFixed(2)}
          </span>
        </div>
        <button className="btn btn-primary btn-block" onClick={place}>
          {slip.length ? `Place bet · €${payout.toFixed(2)}` : "Add a selection"}
        </button>
      </div>
    </div>
  );
}
