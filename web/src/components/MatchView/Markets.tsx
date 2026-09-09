import { useMemo } from "react";
import { MarketPriceButton } from "../PriceButtons";
import { usePriceDrift } from "../../hooks/usePriceDrift";
import { useBetSlip } from "../../state/BetSlipContext";
import { findMarket } from "../../lib/odds";
import type { OddsMarket } from "../../types";

export function Markets({ fixtureId, matchLabel, markets }: { fixtureId: number; matchLabel: string; markets: OddsMarket[] }) {
  const { addPick, isSelected } = useBetSlip();

  const oneXTwo = findMarket(markets, "Match result");
  const totals = findMarket(markets, "Total goals");
  const btts = findMarket(markets, "Both teams to score");

  const driftValues = useMemo(() => {
    const vals: Record<string, number | null> = {};
    for (const m of markets) for (const p of m.prices) vals[`${fixtureId}:${m.name}:${p.label}`] = p.odd;
    return vals;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId, JSON.stringify(markets)]);
  const drift = usePriceDrift(driftValues);

  const cards: { name: string; market: OddsMarket | undefined; cols: string }[] = [
    { name: "Match result", market: oneXTwo, cols: "repeat(3,1fr)" },
    { name: "Total goals", market: totals, cols: "repeat(2,1fr)" },
    { name: "Both teams to score", market: btts, cols: "repeat(2,1fr)" },
  ];

  return (
    <div>
      <h4 style={{ margin: "0 0 10px" }}>Markets</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 10 }}>
        {cards
          .filter((c) => c.market && c.market.prices.length > 0)
          .map((c) => (
            <div key={c.name} style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-neutral-500)", marginBottom: 10 }}>
                {c.name}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: c.cols, gap: 8 }}>
                {c.market!.prices.map((p) => {
                  const key = `${fixtureId}:${c.market!.name}:${p.label}`;
                  return (
                    <MarketPriceButton
                      key={p.label}
                      label={p.label}
                      odd={p.odd}
                      drift={drift[key]}
                      selected={isSelected(key)}
                      onClick={() =>
                        p.odd != null &&
                        addPick({ key, market: c.name, label: p.label, odds: p.odd, match: matchLabel })
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
