import { ArrowLeft } from "@phosphor-icons/react";
import { api } from "../api";
import { usePolling } from "../hooks/usePolling";
import { TeamCrest } from "./TeamCrest";
import { scoreText, statusInfo } from "../lib/format";

export function TeamView({
  teamId,
  onBack,
  onSelectPlayer,
  onSelectTeam,
  onOpenMatch,
}: {
  teamId: number;
  onBack: () => void;
  onSelectPlayer: (playerId: number) => void;
  onSelectTeam: (teamId: number) => void;
  onOpenMatch: (fixtureId: number) => void;
}) {
  const { data: profile, error, loading } = usePolling(() => api.teamProfile(teamId), 60 * 60_000, [teamId]);
  const { data: stats } = usePolling(() => api.teamStatistics(teamId), 15 * 60_000, [teamId]);
  const { data: fixtures } = usePolling(() => api.teamFixtures(teamId, 10), 5 * 60_000, [teamId]);
  const { data: squad } = usePolling(() => api.teamPlayers(teamId), 5 * 60_000, [teamId]);

  return (
    <div className="tl-fade-in" style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 28px 0" }}>
      <button className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }} onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {loading && !profile && <p className="text-muted">Loading team…</p>}
      {error && (
        <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--color-surface)", color: "var(--color-accent-300)" }}>
          Couldn't load this team: {error}
        </div>
      )}

      {profile && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "22px 24px",
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(120deg, #20233a 0%, var(--color-surface) 55%, #1c1e2c 100%)",
              boxShadow: "var(--shadow-md)",
              marginBottom: "var(--space-6)",
            }}
          >
            <TeamCrest id={profile.id} logo={profile.logo} name={profile.name} size={64} />
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 32, margin: "0 0 6px" }}>{profile.name}</h1>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--color-neutral-400)" }}>
                {profile.country && <span>{profile.country}</span>}
                {profile.founded != null && <span>Founded {profile.founded}</span>}
                {profile.venueName && <span>{profile.venueName}{profile.venueCity ? ` · ${profile.venueCity}` : ""}</span>}
              </div>
            </div>
          </div>

          {stats && stats.played > 0 && (
            <div
              style={{
                padding: "16px 18px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-sm)",
                marginBottom: "var(--space-6)",
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-neutral-500)", marginBottom: 12 }}>
                This season · Champions League
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(80px,1fr))", gap: 12, textAlign: "center" }}>
                {[
                  ["Played", stats.played],
                  ["Won", stats.wins],
                  ["Drawn", stats.draws],
                  ["Lost", stats.losses],
                  ["GF", stats.goalsFor],
                  ["GA", stats.goalsAgainst],
                  ["Clean sheets", stats.cleanSheets],
                  ["Form", stats.form || "—"],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: 17, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
                    <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-8)", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 420px", minWidth: 0 }}>
              <h4 style={{ margin: "0 0 10px" }}>Recent results</h4>
              <div style={{ borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
                {(fixtures ?? []).map((f) => {
                  const status = statusInfo(f);
                  const opponent = f.home.id === teamId ? f.away : f.home;
                  const isHome = f.home.id === teamId;
                  return (
                    <div
                      key={f.id}
                      className="tl-player-clickable"
                      onClick={() => onOpenMatch(f.id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--color-divider)" }}
                    >
                      <span style={{ fontSize: 10, color: "var(--color-neutral-600)", width: 28 }}>{isHome ? "H" : "A"}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTeam(opponent.id);
                        }}
                      >
                        <TeamCrest id={opponent.id} logo={opponent.logo} name={opponent.name} size={18} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTeam(opponent.id);
                          }}
                          style={{ display: "inline-block", maxWidth: "100%", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {opponent.name}
                        </span>
                      </span>
                      <span style={{ fontSize: 10, color: "var(--color-neutral-600)", maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {f.competitionName}
                      </span>
                      <span style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontVariantNumeric: "tabular-nums", width: 56, textAlign: "right" }}>
                        {status.isFinished ? scoreText(f) : status.text}
                      </span>
                    </div>
                  );
                })}
                {(fixtures ?? []).length === 0 && (
                  <div style={{ padding: 16 }}>
                    <p className="text-muted" style={{ fontSize: 12 }}>No recent results found.</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: "1 1 300px", minWidth: 0 }}>
              <h4 style={{ margin: "0 0 10px" }}>Squad</h4>
              <div style={{ borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
                {(squad ?? [])
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((p) => (
                    <div
                      key={p.id}
                      className="tl-player-clickable"
                      onClick={() => onSelectPlayer(p.id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderBottom: "1px solid var(--color-divider)" }}
                    >
                      <span style={{ flex: 1, fontSize: 13 }} className="tl-player-name">
                        {p.name}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>{p.position}</span>
                    </div>
                  ))}
                {(squad ?? []).length === 0 && (
                  <div style={{ padding: 16 }}>
                    <p className="text-muted" style={{ fontSize: 12 }}>No squad data found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
