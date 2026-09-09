import type { OddsMarket, OddsPrice } from "../types";

export function findMarket(markets: OddsMarket[], name: string): OddsMarket | undefined {
  return markets.find((m) => m.name === name);
}

export function findPrice(market: OddsMarket | undefined, label: string): OddsPrice | undefined {
  return market?.prices.find((p) => p.label.toLowerCase() === label.toLowerCase());
}

export function fmtOdd(v: number | null | undefined): string {
  return v == null ? "—" : v.toFixed(2);
}

/** Vig-adjusted win probabilities from the three 1X2 decimal odds. */
export function impliedProbabilities(home: number | null, draw: number | null, away: number | null) {
  const ph = home ? 1 / home : 0;
  const pd = draw ? 1 / draw : 0;
  const pa = away ? 1 / away : 0;
  const sum = ph + pd + pa || 1;
  return {
    home: (ph / sum) * 100,
    draw: (pd / sum) * 100,
    away: (pa / sum) * 100,
  };
}
