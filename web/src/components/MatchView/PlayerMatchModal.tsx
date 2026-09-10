import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";
import { TeamCrest } from "../TeamCrest";
import type { PlayerMatchStats } from "../../types";

export function PlayerMatchModal({
  player,
  teamName,
  onClose,
  onViewProfile,
}: {
  player: PlayerMatchStats;
  teamName: string;
  onClose: () => void;
  onViewProfile: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div className="dialog-backdrop" style={{ zIndex: 200, background: "rgba(8,9,14,0.72)" }} onClick={onClose}>
      <div className="dialog tl-fade-in" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TeamCrest id={player.teamId} logo="" name={teamName} size={26} />
            <div>
              <div className="dialog-title">
                {player.number != null ? `#${player.number} ` : ""}
                {player.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>
                {teamName}
                {player.position ? ` · ${player.position}` : ""}
              </div>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="dialog-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, textAlign: "center", marginTop: 4 }}>
            {[
              ["Rating", player.rating?.toFixed(1) ?? "—", "var(--color-accent-300)"],
              ["Minutes", player.minutes || "—", "var(--color-text)"],
              ["Goals", player.goals, "var(--color-text)"],
              ["Assists", player.assists, "var(--color-text)"],
              ["Shots", player.shots, "var(--color-text)"],
              ["On target", player.shotsOnTarget, "var(--color-text)"],
              ["Pass %", player.passAccuracy != null ? `${player.passAccuracy}%` : "—", "var(--color-text)"],
              ["Fouls", player.fouls, "var(--color-text)"],
            ].map(([label, value, color]) => (
              <div key={label as string}>
                <div style={{ fontSize: 20, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums", color: color as string }}>
                  {value}
                </div>
                <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
          {(player.yellowCards > 0 || player.redCards > 0) && (
            <div style={{ marginTop: 14, display: "flex", gap: 12, fontSize: 12, color: "var(--color-neutral-400)" }}>
              {player.yellowCards > 0 && <span>{player.yellowCards} yellow card{player.yellowCards > 1 ? "s" : ""}</span>}
              {player.redCards > 0 && <span>{player.redCards} red card</span>}
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onViewProfile}>
            View full profile
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
