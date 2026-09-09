import { useMemo, useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { api } from "../../api";
import { usePolling } from "../../hooks/usePolling";
import { TeamCrest } from "../TeamCrest";
import { Pitch } from "./Pitch";
import { Markets } from "./Markets";
import { LiveFeed } from "./LiveFeed";
import { MatchStats } from "./MatchStats";
import { MatchPlayerStats } from "./MatchPlayerStats";
import { PlayerMatchModal } from "./PlayerMatchModal";
import { findMarket, findPrice, impliedProbabilities } from "../../lib/odds";
import { scoreText, statusInfo } from "../../lib/format";
import type { PlayerMatchStats } from "../../types";

export function MatchView({
  fixtureId,
  onBack,
  onSelectPlayer,
  onSelectTeam,
}: {
  fixtureId: number;
  onBack: () => void;
  onSelectPlayer: (playerId: number) => void;
  onSelectTeam: (teamId: number) => void;
}) {
  const [side, setSide] = useState<"both" | "home" | "away">("both");
  const [modalPlayerId, setModalPlayerId] = useState<number | null>(null);

  const { data: fixture } = usePolling(() => api.fixture(fixtureId), 15_000, [fixtureId]);
  const { data: lineups } = usePolling(() => api.lineups(fixtureId), 60_000, [fixtureId]);
  const { data: markets } = usePolling(() => api.odds(fixtureId), 30_000, [fixtureId]);
  const { data: stats } = usePolling(() => api.statistics(fixtureId), 15_000, [fixtureId]);
  const { data: events } = usePolling(
    () => (fixture ? api.events(fixtureId, fixture.home.id) : Promise.resolve([])),
    10_000,
    [fixtureId, fixture?.home.id]
  );
  const { data: matchPlayerStats } = usePolling(
    () => api.fixturePlayerStats(fixtureId),
    15_000,
    [fixtureId]
  );

  const playerStats = useMemo(() => {
    const map = new Map<number, PlayerMatchStats>();
    for (const p of matchPlayerStats ?? []) map.set(p.id, p);
    return map;
  }, [matchPlayerStats]);

  const homeLineup = lineups?.find((l) => l.teamId === fixture?.home.id);
  const awayLineup = lineups?.find((l) => l.teamId === fixture?.away.id);

  const oneXTwo = findMarket(markets ?? [], "Match result");
  const home = findPrice(oneXTwo, "Home");
  const draw = findPrice(oneXTwo, "Draw");
  const away = findPrice(oneXTwo, "Away");
  const prob = impliedProbabilities(home?.odd ?? null, draw?.odd ?? null, away?.odd ?? null);

  if (!fixture) {
    return (
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 28px 0" }}>
        <p className="text-muted">Loading match…</p>
      </div>
    );
  }

  const status = statusInfo(fixture);
  const matchLabel = `${fixture.home.name} v ${fixture.away.name}`;

  return (
    <div className="tl-fade-in" style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 28px 0" }}>
      <button className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }} onClick={onBack}>
        <ArrowLeft size={16} />
        <span>All matches</span>
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: "var(--space-8)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", minWidth: 0 }}>
          <div
            style={{
              padding: "22px 24px",
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(120deg, #20233a 0%, var(--color-surface) 55%, #1c1e2c 100%)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
              <div
                className="tl-player-clickable"
                onClick={() => onSelectTeam(fixture.home.id)}
                style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}
              >
                <TeamCrest id={fixture.home.id} logo={fixture.home.logo} name={fixture.home.name} size={30} />
                <span className="tl-player-name" style={{ fontFamily: "var(--font-heading)", fontSize: 24 }}>
                  {fixture.home.name}
                </span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 40, fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em" }}>
                  {scoreText(fixture)}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: status.isLive ? "var(--color-accent-300)" : "var(--color-neutral-500)",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {status.isLive ? `${status.text} live` : status.isFinished ? "Full time" : `Kick off ${status.text}`}
                </div>
              </div>
              <div
                className="tl-player-clickable"
                onClick={() => onSelectTeam(fixture.away.id)}
                style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end", minWidth: 0 }}
              >
                <span className="tl-player-name" style={{ fontFamily: "var(--font-heading)", fontSize: 24 }}>
                  {fixture.away.name}
                </span>
                <TeamCrest id={fixture.away.id} logo={fixture.away.logo} name={fixture.away.name} size={30} />
              </div>
            </div>

            {!status.isFinished && (home?.odd || draw?.odd || away?.odd) && (
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-neutral-500)",
                    marginBottom: 7,
                  }}
                >
                  <span>Win probability</span>
                  <span>
                    {prob.home.toFixed(0)}% · {prob.draw.toFixed(0)}% · {prob.away.toFixed(0)}%
                  </span>
                </div>
                <div style={{ display: "flex", height: 10, borderRadius: 20, overflow: "hidden", background: "var(--color-neutral-900)" }}>
                  <div style={{ width: `${prob.home}%`, background: "linear-gradient(90deg, var(--color-accent-500), var(--color-accent-400))", transition: "width 0.9s cubic-bezier(.2,.8,.2,1)" }} />
                  <div style={{ width: `${prob.draw}%`, background: "var(--color-neutral-700)", transition: "width 0.9s cubic-bezier(.2,.8,.2,1)" }} />
                  <div style={{ width: `${prob.away}%`, background: "linear-gradient(90deg, var(--color-neutral-500), var(--color-neutral-400))", transition: "width 0.9s cubic-bezier(.2,.8,.2,1)" }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: "var(--radius-md)", background: "var(--color-neutral-900)" }}>
              {([
                { key: "both", label: "Both teams" },
                { key: "home", label: fixture.home.name },
                { key: "away", label: fixture.away.name },
              ] as const).map((s) => (
                <button
                  key={s.key}
                  className="tl-side-btn"
                  onClick={() => setSide(s.key)}
                  style={{
                    background: side === s.key ? "var(--color-accent-800)" : "transparent",
                    color: side === s.key ? "var(--color-accent-100)" : "var(--color-neutral-400)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "var(--color-neutral-500)", fontVariantNumeric: "tabular-nums" }}>
              {homeLineup?.formation ?? "—"} · {awayLineup?.formation ?? "—"}
            </span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>Hover a player for form, click for full stats</span>
          </div>

          {homeLineup || awayLineup ? (
            <Pitch
              homeLineup={homeLineup}
              awayLineup={awayLineup}
              homeTeamId={fixture.home.id}
              awayTeamId={fixture.away.id}
              side={side}
              playerStats={playerStats}
              onSelectPlayer={setModalPlayerId}
            />
          ) : (
            <div style={{ padding: 24, borderRadius: "var(--radius-lg)", background: "var(--color-surface)", textAlign: "center" }}>
              <p className="text-muted">Lineups aren't published yet — they usually land about an hour before kick off.</p>
            </div>
          )}

          {!status.isFinished && <Markets fixtureId={fixtureId} matchLabel={matchLabel} markets={markets ?? []} />}

          <MatchPlayerStats
            homeName={fixture.home.name}
            awayName={fixture.away.name}
            homeTeamId={fixture.home.id}
            awayTeamId={fixture.away.id}
            players={matchPlayerStats ?? []}
            onSelectPlayer={setModalPlayerId}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", position: "sticky", top: 84 }}>
          <LiveFeed events={events ?? []} title={status.isFinished ? "Match events" : "Live feed"} />
          <MatchStats stats={stats ?? []} />
        </div>
      </div>

      {modalPlayerId != null &&
        (() => {
          const p = playerStats.get(modalPlayerId);
          if (!p) return null;
          const teamName = p.teamId === fixture.home.id ? fixture.home.name : fixture.away.name;
          return (
            <PlayerMatchModal
              player={p}
              teamName={teamName}
              onClose={() => setModalPlayerId(null)}
              onViewProfile={() => {
                setModalPlayerId(null);
                onSelectPlayer(modalPlayerId);
              }}
            />
          );
        })()}
    </div>
  );
}
