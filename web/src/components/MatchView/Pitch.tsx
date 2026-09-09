import { useState } from "react";
import { layoutFormation } from "../../lib/formation";
import { PlayerToken } from "./PlayerToken";
import { HoverCard } from "./HoverCard";
import type { Lineup, LineupPlayer, PlayerSeasonStats } from "../../types";

interface HoverState {
  player: LineupPlayer;
  pos: { x: number; y: number };
}

export function Pitch({
  homeLineup,
  awayLineup,
  homeTeamId,
  awayTeamId,
  side,
  playerStats,
}: {
  homeLineup: Lineup | undefined;
  awayLineup: Lineup | undefined;
  homeTeamId: number;
  awayTeamId: number;
  side: "both" | "home" | "away";
  playerStats: Map<number, PlayerSeasonStats>;
}) {
  const [hover, setHover] = useState<HoverState | null>(null);

  const renderSide = (lineup: Lineup | undefined, teamId: number, isHome: boolean) => {
    if (!lineup) return null;
    const positions = layoutFormation(lineup.formation, isHome);
    return lineup.startXI.map((player, i) => (
      <PlayerToken
        key={player.id}
        player={player}
        pos={positions[i]}
        teamId={teamId}
        isHome={isHome}
        index={i}
        onEnter={() => setHover({ player, pos: positions[i] })}
        onLeave={() => setHover(null)}
      />
    ));
  };

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "16/10",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "radial-gradient(120% 90% at 50% 50%, #1f2236 0%, #14161f 100%)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ position: "absolute", inset: 14, border: "1px solid var(--color-neutral-800)", borderRadius: 3 }} />
      <div style={{ position: "absolute", left: "50%", top: 14, bottom: 14, width: 1, background: "var(--color-neutral-800)" }} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: "19%",
          aspectRatio: "1",
          border: "1px solid var(--color-neutral-800)",
          borderRadius: "50%",
        }}
      />
      <div style={{ position: "absolute", left: 14, top: "26%", bottom: "26%", width: "12%", border: "1px solid var(--color-neutral-800)", borderLeft: "none" }} />
      <div style={{ position: "absolute", right: 14, top: "26%", bottom: "26%", width: "12%", border: "1px solid var(--color-neutral-800)", borderRight: "none" }} />
      <div style={{ position: "absolute", left: 14, top: "39%", bottom: "39%", width: "5%", border: "1px solid var(--color-neutral-800)", borderLeft: "none" }} />
      <div style={{ position: "absolute", right: 14, top: "39%", bottom: "39%", width: "5%", border: "1px solid var(--color-neutral-800)", borderRight: "none" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 7%, transparent) 0%, transparent 45%)",
        }}
      />

      {side !== "away" && renderSide(homeLineup, homeTeamId, true)}
      {side !== "home" && renderSide(awayLineup, awayTeamId, false)}

      {hover && <HoverCard player={hover.player} pos={hover.pos} stats={playerStats.get(hover.player.id)} />}
    </div>
  );
}
