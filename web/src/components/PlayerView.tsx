import { ArrowLeft } from "@phosphor-icons/react";
import { api } from "../api";
import { usePolling } from "../hooks/usePolling";
import { TeamCrest } from "./TeamCrest";

export function PlayerView({ playerId, onBack }: { playerId: number; onBack: () => void }) {
  const { data: profile, error, loading } = usePolling(() => api.playerProfile(playerId), 5 * 60_000, [playerId]);

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
            <img
              src={profile.bio.photo}
              alt=""
              width={84}
              height={84}
              style={{ borderRadius: "50%", background: "var(--color-neutral-900)", flex: "none", objectFit: "cover" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
              }}
            />
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 32, margin: "0 0 6px" }}>{profile.bio.name}</h1>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--color-neutral-400)" }}>
                {profile.bio.nationality && <span>{profile.bio.nationality}</span>}
                {profile.bio.age != null && <span>{profile.bio.age} years old</span>}
                {profile.bio.height && <span>{profile.bio.height}</span>}
                {profile.bio.weight && <span>{profile.bio.weight}</span>}
              </div>
            </div>
          </div>

          <h4 style={{ margin: "0 0 10px" }}>Season by competition</h4>
          {profile.stats.length === 0 && <p className="text-muted">No statistics recorded for this season.</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {profile.stats.map((s, i) => (
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
                  <TeamCrest id={s.teamId} logo={s.teamLogo} name={s.teamName} size={22} />
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{s.teamName}</span>
                  <span style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>· {s.leagueName}</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>{s.position}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(80px,1fr))", gap: 12, textAlign: "center" }}>
                  {[
                    ["Apps", s.appearances],
                    ["Mins", s.minutes],
                    ["Goals", s.goals],
                    ["Assists", s.assists],
                    ["Shots", s.shots],
                    ["On target", s.shotsOnTarget],
                    ["Pass %", s.passAccuracy != null ? `${s.passAccuracy}%` : "—"],
                    ["Fouls", s.fouls],
                    ["Yellow", s.yellowCards],
                    ["Red", s.redCards],
                    ["Rating", s.rating?.toFixed(1) ?? "—"],
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
            ))}
          </div>
        </>
      )}
    </div>
  );
}
