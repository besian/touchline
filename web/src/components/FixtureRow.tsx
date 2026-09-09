import { useMemo } from "react";
import { api } from "../api";
import { usePolling } from "../hooks/usePolling";
import { usePriceDrift } from "../hooks/usePriceDrift";
import { useBetSlip } from "../state/BetSlipContext";
import { TeamCrest } from "./TeamCrest";
import { OddsPill } from "./PriceButtons";
import { findMarket, findPrice } from "../lib/odds";
import { scoreText, statusInfo } from "../lib/format";
import type { Fixture } from "../types";

export function FixtureRow({ fixture, onOpen }: { fixture: Fixture; onOpen: () => void }) {
  const { data: markets } = usePolling(() => api.odds(fixture.id), 45_000, [fixture.id]);
  const { addPick, isSelected } = useBetSlip();

  const oneXTwo = findMarket(markets ?? [], "Match result");
  const home = findPrice(oneXTwo, "Home");
  const draw = findPrice(oneXTwo, "Draw");
  const away = findPrice(oneXTwo, "Away");

  const driftValues = useMemo(
    () => ({
      [`${fixture.id}:1`]: home?.odd ?? null,
      [`${fixture.id}:x`]: draw?.odd ?? null,
      [`${fixture.id}:2`]: away?.odd ?? null,
    }),
    [fixture.id, home?.odd, draw?.odd, away?.odd]
  );
  const drift = usePriceDrift(driftValues);

  const status = statusInfo(fixture);
  const matchLabel = `${fixture.home.name} v ${fixture.away.name}`;

  const pick = (label: string, key: string, odd: number | null | undefined) => {
    if (odd == null) return;
    addPick({ key: `${fixture.id}:${key}`, market: "Match result", label, odds: odd, match: matchLabel });
  };

  return (
    <div
      className="tl-fixture-row"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 96px 300px",
        gap: "var(--space-6)",
        alignItems: "center",
        padding: "16px 18px",
        borderRadius: "var(--radius-md)",
        background: "linear-gradient(90deg, var(--color-surface) 0%, #1e2030 100%)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", cursor: "pointer", minWidth: 0 }} onClick={onOpen}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TeamCrest id={fixture.home.id} logo={fixture.home.logo} name={fixture.home.name} />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 17, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {fixture.home.name}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TeamCrest id={fixture.away.id} logo={fixture.away.logo} name={fixture.away.name} />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 17, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {fixture.away.name}
            </span>
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 26,
            fontVariantNumeric: "tabular-nums",
            color: status.isLive || status.isFinished ? "var(--color-text)" : "var(--color-neutral-600)",
            letterSpacing: "0.04em",
          }}
        >
          {scoreText(fixture)}
        </div>
      </div>
      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            padding: "3px 9px",
            borderRadius: 20,
            border: `1px solid ${status.isLive ? "var(--color-accent-700)" : "var(--color-neutral-800)"}`,
            color: status.isLive ? "var(--color-accent-300)" : "var(--color-neutral-500)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span
            className={status.isLive ? "tl-pulse-dot" : undefined}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: status.isLive ? "var(--color-accent-300)" : "var(--color-neutral-500)",
            }}
          />
          {status.text}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        <OddsPill
          odd={home?.odd ?? null}
          drift={drift[`${fixture.id}:1`]}
          selected={isSelected(`${fixture.id}:1`)}
          onClick={() => pick(fixture.home.name, "1", home?.odd)}
        />
        <OddsPill
          odd={draw?.odd ?? null}
          drift={drift[`${fixture.id}:x`]}
          selected={isSelected(`${fixture.id}:x`)}
          onClick={() => pick("Draw", "x", draw?.odd)}
        />
        <OddsPill
          odd={away?.odd ?? null}
          drift={drift[`${fixture.id}:2`]}
          selected={isSelected(`${fixture.id}:2`)}
          onClick={() => pick(fixture.away.name, "2", away?.odd)}
        />
      </div>
    </div>
  );
}
