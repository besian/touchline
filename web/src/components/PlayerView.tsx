import { ArrowLeft, Barbell, CalendarBlank, Globe, Ruler, User } from "@phosphor-icons/react";
import { api } from "../api";
import { usePolling } from "../hooks/usePolling";
import { TeamCrest } from "./TeamCrest";
import type { PlayerCompetitionStats } from "../types";

function ratingColor(r: number | null): string {
  if (r == null) return "var(--color-neutral-500)";
  if (r >= 7.5) return "var(--color-accent-300)";
  if (r >= 6.5) return "var(--color-text)";
  return "var(--color-neutral-500)";
}

function BioPill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: 20,
        background: "color-mix(in srgb, var(--color-text) 7%, transparent)",
        fontSize: 12,
        color: "var(--color-neutral-300)",
      }}
    >
      {icon}
      {children}
    </span>
  );
}

export function PlayerView({
  playerId,
  onBack,
  onSelectTeam,
}: {
  playerId: number;
  onBack: () => void;
  onSelectTeam: (teamId: number) => void;
}) {
  const { data: profile, error, loading } = usePolling(() => api.playerProfile(playerId), 5 * 60_000, [playerId]);

  const stats = profile?.stats ?? [];
  const sortedStats = [...stats].sort((a, b) => {
    const aFirst = a.leagueName?.includes("Champions League") ? 0 : 1;
    const bFirst = b.leagueName?.includes("Champions League") ? 0 : 1;
    return aFirst - bFirst;
  });
  const primaryNumber = sortedStats.find((s) => s.number != null)?.number ?? null;

  const totals = stats.reduce(
    (acc, s) => ({
      goals: acc.goals + s.goals,
      assists: acc.assists + s.assists,
      apps: acc.apps + s.appearances,
      ratingSum: acc.ratingSum + (s.rating ?? 0),
      ratingCount: acc.ratingCount + (s.rating != null ? 1 : 0),
    }),
    { goals: 0, assists: 0, apps: 0, ratingSum: 0, ratingCount: 0 }
  );
  const avgRating = totals.ratingCount ? totals.ratingSum / totals.ratingCount : null;

  return (
    <div className="tl-fade-in" style={{ maxWidth: 900, margin: "0 auto", padding: "24px 28px 0" }}>
      <button className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }} onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {loading && !profile && <p className="text-muted">Loading player…</p>}
      {error && (
        <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--color-surface)", color: "var(--color-accent-300)" }}>
          Couldn't load this player: {error}
        </div>
      )}

      {profile && (
        <>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "26px 28px",
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(120deg, #20233a 0%, var(--color-surface) 55%, #1c1e2c 100%)",
              boxShadow: "var(--shadow-md)",
              marginBottom: "var(--space-6)",
              overflow: "hidden",
            }}
          >
            {primaryNumber != null && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 150,
                  fontFamily: "var(--font-heading)",
                  fontWeight: 500,
                  lineHeight: 1,
                  color: "color-mix(in srgb, var(--color-text) 5%, transparent)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                {primaryNumber}
              </div>
            )}

            <div
              style={{
                position: "relative",
                width: 96,
                height: 96,
                flex: "none",
                borderRadius: "50%",
                background: "var(--color-neutral-900)",
                boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-accent) 30%, transparent)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <User size={44} color="var(--color-neutral-600)" weight="fill" />
              {profile.bio.photo && (
                <img
                  src={profile.bio.photo}
                  alt=""
                  width={96}
                  height={96}
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", objectFit: "cover" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  onLoad={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "block";
                  }}
                />
              )}
            </div>

            <div style={{ minWidth: 0, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 34, margin: "0 0 8px" }}>{profile.bio.name}</h1>
                {primaryNumber != null && (
                  <span className="tag tag-accent" style={{ fontVariantNumeric: "tabular-nums" }}>
                    #{primaryNumber}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {profile.bio.nationality && (
                  <BioPill icon={<Globe size={13} />}>{profile.bio.nationality}</BioPill>
                )}
                {profile.bio.age != null && (
                  <BioPill icon={<CalendarBlank size={13} />}>{profile.bio.age} yrs</BioPill>
                )}
                {profile.bio.height && <BioPill icon={<Ruler size={13} />}>{profile.bio.height}</BioPill>}
                {profile.bio.weight && <BioPill icon={<Barbell size={13} />}>{profile.bio.weight}</BioPill>}
              </div>
            </div>
          </div>

          {stats.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-8)",
                padding: "16px 22px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-sm)",
                marginBottom: "var(--space-6)",
              }}
            >
              <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-neutral-500)", alignSelf: "center", marginRight: "auto" }}>
                All competitions
              </span>
              {[
                ["Apps", totals.apps],
                ["Goals", totals.goals],
                ["Assists", totals.assists],
                ["Avg rating", avgRating != null ? avgRating.toFixed(1) : "—"],
              ].map(([label, value]) => (
                <div key={label as string} style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h4 style={{ margin: "0 0 10px" }}>By competition</h4>
          {stats.length === 0 && <p className="text-muted">No statistics recorded for this season.</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sortedStats.map((s: PlayerCompetitionStats, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 18px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div
                    className="tl-player-clickable"
                    onClick={() => onSelectTeam(s.teamId)}
                    style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
                  >
                    <TeamCrest id={s.teamId} logo={s.teamLogo} name={s.teamName} size={22} />
                    <span className="tl-player-name" style={{ fontFamily: "var(--font-heading)", fontSize: 15, whiteSpace: "nowrap" }}>
                      {s.teamName}
                    </span>
                  </div>
                  <span className="tag tag-neutral" style={{ whiteSpace: "nowrap" }}>
                    {s.leagueName}
                  </span>
                  {s.position && (
                    <span style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>{s.position}</span>
                  )}
                  <div style={{ flex: 1 }} />
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums", color: ratingColor(s.rating) }}>
                      {s.rating?.toFixed(1) ?? "—"}
                    </div>
                    <div style={{ fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
                      rating
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, textAlign: "center" }}>
                  {[
                    ["Apps", s.appearances],
                    ["Mins", s.minutes],
                    ["Goals", s.goals],
                    ["Assists", s.assists],
                    ["Shots", s.shots],
                    ["On target", s.shots ? `${s.shotsOnTarget} (${Math.round((s.shotsOnTarget / s.shots) * 100)}%)` : s.shotsOnTarget],
                    ["Pass %", s.passAccuracy != null ? `${s.passAccuracy}%` : "—"],
                    ["Fouls", s.fouls],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div style={{ fontSize: 17, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
                      <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
                {(s.yellowCards > 0 || s.redCards > 0) && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--color-divider)", display: "flex", gap: 14, fontSize: 12, color: "var(--color-neutral-400)" }}>
                    {s.yellowCards > 0 && <span>{s.yellowCards} yellow card{s.yellowCards > 1 ? "s" : ""}</span>}
                    {s.redCards > 0 && <span>{s.redCards} red card</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
