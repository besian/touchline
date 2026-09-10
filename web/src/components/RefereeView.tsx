import { ArrowLeft, User } from "@phosphor-icons/react";
import { api } from "../api";
import { usePolling } from "../hooks/usePolling";
import { TeamCrest } from "./TeamCrest";

export function RefereeView({
  name,
  onBack,
  onOpenMatch,
}: {
  name: string;
  onBack: () => void;
  onOpenMatch: (fixtureId: number) => void;
}) {
  const { data: profile, error, loading } = usePolling(() => api.refereeProfile(name), 5 * 60_000, [name]);

  return (
    <div className="tl-fade-in" style={{ maxWidth: 900, margin: "0 auto", padding: "24px 28px 0" }}>
      <button className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }} onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {loading && !profile && <p className="text-muted">Loading referee…</p>}
      {error && (
        <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--color-surface)", color: "var(--color-accent-300)" }}>
          Couldn't load this referee: {error}
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
            <div
              style={{
                width: 64,
                height: 64,
                flex: "none",
                borderRadius: "50%",
                background: "var(--color-neutral-900)",
                boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-accent) 30%, transparent)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <User size={30} color="var(--color-neutral-600)" weight="fill" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 32, margin: "0 0 6px" }}>{profile.name}</h1>
              <div style={{ fontSize: 13, color: "var(--color-neutral-400)" }}>
                Champions League referee · {profile.matches} match{profile.matches === 1 ? "" : "es"} on record
              </div>
            </div>
          </div>

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
              Discipline record
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 12, textAlign: "center" }}>
              {[
                ["Matches", profile.matches],
                ["Yellow cards", profile.yellowCards],
                ["Red cards", profile.redCards],
                ["Penalties", profile.penalties],
                ["Yellows / match", profile.avgYellowPerMatch.toFixed(1)],
                ["Cards / match", profile.avgCardsPerMatch.toFixed(1)],
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

          <h4 style={{ margin: "0 0 10px" }}>Match history</h4>
          <div style={{ borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
            {profile.matchHistory.map((m) => {
              return (
                <div
                  key={m.fixtureId}
                  className="tl-player-clickable"
                  onClick={() => onOpenMatch(m.fixtureId)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--color-divider)" }}
                >
                  <span style={{ fontSize: 9, letterSpacing: "0.08em", color: "var(--color-neutral-700)", width: 26 }}>
                    {m.round.replace(/^.*- /, "R")}
                  </span>
                  <TeamCrest id={m.home.id} logo={m.home.logo} name={m.home.name} size={16} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.home.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
                    {m.goalsHome ?? 0} – {m.goalsAway ?? 0}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.away.name}
                  </span>
                  <TeamCrest id={m.away.id} logo={m.away.logo} name={m.away.name} size={16} />
                  <span style={{ display: "flex", gap: 6, width: 110, justifyContent: "flex-end", fontSize: 11, color: "var(--color-neutral-500)" }}>
                    <span title="Yellow cards">🟨 {m.yellowCards}</span>
                    <span title="Red cards">🟥 {m.redCards}</span>
                    {m.penalties > 0 && <span title="Penalties">⚽ {m.penalties}</span>}
                  </span>
                </div>
              );
            })}
            {profile.matchHistory.length === 0 && (
              <div style={{ padding: 16 }}>
                <p className="text-muted" style={{ fontSize: 12 }}>No match history found.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
