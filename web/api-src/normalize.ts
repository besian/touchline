import type { Fixture, Lineup, MatchEvent, OddsMarket, PlayerProfile, PlayerSeasonStats, StatPair } from "./types.js";

// The API-Football response shapes are large and only partially documented;
// these helpers pick out exactly the fields Touchline renders.
/* eslint-disable @typescript-eslint/no-explicit-any */

export function normalizeFixture(raw: any): Fixture {
  return {
    id: raw.fixture.id,
    round: raw.league.round,
    status: raw.fixture.status.short,
    elapsed: raw.fixture.status.elapsed,
    kickoff: raw.fixture.date,
    home: { id: raw.teams.home.id, name: raw.teams.home.name, logo: raw.teams.home.logo },
    away: { id: raw.teams.away.id, name: raw.teams.away.name, logo: raw.teams.away.logo },
    goalsHome: raw.goals.home,
    goalsAway: raw.goals.away,
  };
}

const EVENT_TYPE: Record<string, MatchEvent["type"]> = {
  Goal: "goal",
  Card: "card",
  subst: "sub",
  Var: "info",
};

export function normalizeEvents(raw: any[], homeTeamId: number): MatchEvent[] {
  return raw.map((e) => {
    const type = EVENT_TYPE[e.type] ?? "info";
    const who = e.player?.name ?? e.team?.name ?? "";
    const detail: string = e.detail ?? "";
    let text = `${who} — ${detail}`;
    if (type === "goal") text = `${e.player?.name ?? "Goal"} — ${detail}${e.assist?.name ? ` (assist: ${e.assist.name})` : ""}`;
    if (type === "sub") text = `${e.team?.name ?? ""}: ${e.assist?.name ?? "?"} on for ${e.player?.name ?? "?"}`;
    if (type === "card") text = `${e.player?.name ?? "?"} — ${detail}`;
    return {
      minute: e.time.elapsed,
      extra: e.time.extra ?? null,
      type,
      detail,
      text,
      side: e.team ? (e.team.id === homeTeamId ? "home" : "away") : null,
    };
  });
}

const STAT_LABELS: Record<string, string> = {
  "Ball Possession": "Possession",
  "Total Shots": "Shots",
  "Corner Kicks": "Corners",
  "expected_goals": "xG",
};
const WANTED_STATS = ["Ball Possession", "Total Shots", "Corner Kicks", "expected_goals"];

export function normalizeStatistics(raw: any[]): StatPair[] {
  if (raw.length < 2) return [];
  const [homeRaw, awayRaw] = raw;
  const homeStats: Record<string, any> = Object.fromEntries((homeRaw.statistics ?? []).map((s: any) => [s.type, s.value]));
  const awayStats: Record<string, any> = Object.fromEntries((awayRaw.statistics ?? []).map((s: any) => [s.type, s.value]));
  const toNum = (v: unknown): number => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    return parseFloat(String(v).replace("%", "")) || 0;
  };
  return WANTED_STATS.filter((k) => homeStats[k] != null || awayStats[k] != null).map((k) => ({
    label: STAT_LABELS[k] ?? k,
    home: toNum(homeStats[k]),
    away: toNum(awayStats[k]),
  }));
}

export function summarizeScorers(raw: any[], homeTeamId: number): string {
  const goals = raw.filter((e) => e.type === "Goal" && e.detail !== "Missed Penalty");
  const bySide: Record<"home" | "away", Record<string, number>> = { home: {}, away: {} };
  for (const g of goals) {
    const side: "home" | "away" = g.team?.id === homeTeamId ? "home" : "away";
    const name = g.player?.name ?? "?";
    bySide[side][name] = (bySide[side][name] ?? 0) + 1;
  }
  const fmtSide = (side: "home" | "away") =>
    Object.entries(bySide[side])
      .map(([name, count]) => (count > 1 ? `${name} ${count}` : name))
      .join(", ");
  return [fmtSide("home"), fmtSide("away")].filter(Boolean).join(" · ");
}

export function normalizeLineups(raw: any[]): Lineup[] {
  return raw.map((l) => ({
    teamId: l.team.id,
    formation: l.formation,
    startXI: (l.startXI ?? []).map((s: any) => ({
      id: s.player.id,
      name: s.player.name,
      number: s.player.number,
      position: s.player.pos,
    })),
  }));
}

const MARKET_NAMES: Record<string, string> = {
  "Match Winner": "Match result",
  "Goals Over/Under": "Total goals",
  "Both Teams Score": "Both teams to score",
};
const WANTED_MARKETS = ["Match Winner", "Goals Over/Under", "Both Teams Score"];

export function normalizeOdds(raw: any[]): OddsMarket[] {
  const bookmaker = raw[0]?.bookmakers?.[0];
  if (!bookmaker) return [];
  const bets: any[] = bookmaker.bets ?? [];
  const overUnder = bets.find((b) => b.name === "Goals Over/Under");
  const ouValues = (overUnder?.values ?? []).filter((v: any) => v.value.includes("2.5"));
  return WANTED_MARKETS.filter((name) => bets.some((b) => b.name === name)).map((name) => {
    const bet = bets.find((b) => b.name === name);
    const values = name === "Goals Over/Under" ? ouValues : bet.values;
    return {
      name: MARKET_NAMES[name],
      prices: values.map((v: any) => ({ label: v.value, odd: parseFloat(v.odd) || null })),
    };
  });
}

export function normalizePlayerStats(raw: any[]): PlayerSeasonStats[] {
  return raw
    .map((p) => {
      const stat = (p.statistics ?? [])[0];
      if (!stat) return null;
      return {
        id: p.player.id,
        name: p.player.name,
        photo: p.player.photo,
        teamId: stat.team?.id,
        teamName: stat.team?.name,
        position: stat.games?.position ?? "",
        minutes: stat.games?.minutes ?? 0,
        goals: stat.goals?.total ?? 0,
        assists: stat.goals?.assists ?? 0,
        shots: stat.shots?.total ?? 0,
        shotsOnTarget: stat.shots?.on ?? 0,
        fouls: stat.fouls?.committed ?? 0,
        rating: stat.games?.rating ? parseFloat(stat.games.rating) : null,
        passAccuracy: stat.passes?.accuracy != null ? parseFloat(stat.passes.accuracy) : null,
      } satisfies PlayerSeasonStats;
    })
    .filter((p): p is PlayerSeasonStats => p !== null);
}

export function normalizePlayerProfile(raw: any): PlayerProfile {
  const p = raw.player;
  return {
    bio: {
      id: p.id,
      name: p.name,
      firstname: p.firstname ?? "",
      lastname: p.lastname ?? "",
      age: p.age ?? null,
      nationality: p.nationality ?? "",
      height: p.height ?? null,
      weight: p.weight ?? null,
      photo: p.photo,
    },
    stats: (raw.statistics ?? []).map((stat: any) => ({
      teamId: stat.team?.id,
      teamName: stat.team?.name,
      teamLogo: stat.team?.logo,
      leagueName: stat.league?.name,
      leagueLogo: stat.league?.logo,
      appearances: stat.games?.appearences ?? 0,
      minutes: stat.games?.minutes ?? 0,
      position: stat.games?.position ?? "",
      rating: stat.games?.rating ? parseFloat(stat.games.rating) : null,
      goals: stat.goals?.total ?? 0,
      assists: stat.goals?.assists ?? 0,
      shots: stat.shots?.total ?? 0,
      shotsOnTarget: stat.shots?.on ?? 0,
      passAccuracy: stat.passes?.accuracy != null ? parseFloat(stat.passes.accuracy) : null,
      fouls: stat.fouls?.committed ?? 0,
      yellowCards: stat.cards?.yellow ?? 0,
      redCards: stat.cards?.red ?? 0,
    })),
  };
}
