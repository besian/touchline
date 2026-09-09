import { colorFromId } from "../../lib/format";
import type { LineupPlayer } from "../../types";
import type { TokenPos } from "../../lib/formation";

export function PlayerToken({
  player,
  pos,
  teamId,
  isHome,
  index,
  onEnter,
  onLeave,
}: {
  player: LineupPlayer;
  pos: TokenPos;
  teamId: number;
  isHome: boolean;
  index: number;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const clubColor = colorFromId(teamId);
  const fill = isHome ? clubColor : "#1b1e2c";
  const ring = isHome ? "color-mix(in srgb, #ffffff 25%, transparent)" : clubColor;
  const glow = isHome ? `0 0 16px color-mix(in srgb, ${clubColor} 45%, transparent)` : "var(--shadow-sm)";
  const numColor = isHome ? "#12141f" : "var(--color-neutral-200)";

  return (
    <div
      className="tl-player-token"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: "absolute",
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%,-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        animation: "tl-token 0.5s cubic-bezier(.2,.9,.2,1) both",
        animationDelay: `${(isHome ? 0 : 120) + index * 45}ms`,
        cursor: "default",
        zIndex: 10,
      }}
    >
      <div
        className="tl-player-dot"
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: fill,
          border: `1px solid ${ring}`,
          boxShadow: glow,
          fontSize: 12,
          fontFamily: "var(--font-heading)",
          fontVariantNumeric: "tabular-nums",
          color: numColor,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {player.number}
      </div>
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.02em",
          color: "var(--color-neutral-300)",
          whiteSpace: "nowrap",
          textShadow: "0 1px 6px #10121b",
        }}
      >
        {player.name}
      </span>
    </div>
  );
}
