import { api } from "../api";
import { usePolling } from "../hooks/usePolling";
import { FixtureRow } from "./FixtureRow";
import { LIVE_STATUSES } from "../types";

export function FixturesView({
  round,
  onOpen,
  onSelectTeam,
}: {
  round: string | null | undefined;
  onOpen: (fixtureId: number) => void;
  onSelectTeam: (teamId: number) => void;
}) {
  const { data: fixtures, error, loading } = usePolling(
    () => (round ? api.fixtures(round) : Promise.resolve([])),
    20_000,
    [round]
  );

  const liveCount = (fixtures ?? []).filter((f) => LIVE_STATUSES.has(f.status)).length;

  return (
    <div className="tl-fade-in" style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 28px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-8)", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 44, margin: "0 0 6px" }}>Tonight's matches</h1>
          <p className="text-muted" style={{ margin: 0, maxWidth: "52ch" }}>
            Prices move as the match does — tap a price to add it to your slip, tap a match to open the pitch.
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 32, fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums" }}>{liveCount}</div>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-neutral-500)" }}>
            live now
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--color-surface)", color: "var(--color-accent-300)", marginBottom: 16 }}>
          Couldn't load fixtures: {error}
        </div>
      )}
      {loading && !fixtures && <p className="text-muted">Loading fixtures…</p>}
      {!loading && fixtures && fixtures.length === 0 && <p className="text-muted">No fixtures found for the current round.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 10 }}>
        {fixtures && fixtures.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) 96px 300px",
              gap: "var(--space-6)",
              padding: "0 18px 8px",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-neutral-600)",
            }}
          >
            <span>Match</span>
            <span>Status</span>
            <span style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, textAlign: "center" }}>
              <span>Home</span>
              <span>Draw</span>
              <span>Away</span>
            </span>
          </div>
        )}
        {(fixtures ?? []).map((f) => (
          <FixtureRow key={f.id} fixture={f} onOpen={() => onOpen(f.id)} onSelectTeam={onSelectTeam} />
        ))}
      </div>
    </div>
  );
}
