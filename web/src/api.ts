import type { Fixture, Lineup, MatchEvent, OddsMarket, PastResult, PlayerSeasonStats, StatPair } from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  currentRound: () => get<{ round: string | null }>("/round/current"),
  fixtures: (round?: string) => get<Fixture[]>(`/fixtures${round ? `?round=${encodeURIComponent(round)}` : ""}`),
  liveFixtures: () => get<Fixture[]>("/fixtures/live"),
  pastResults: (last = 8) => get<PastResult[]>(`/fixtures/past?last=${last}`),
  fixture: (fixtureId: number) => get<Fixture>(`/fixtures/${fixtureId}`),
  lineups: (fixtureId: number) => get<Lineup[]>(`/fixtures/${fixtureId}/lineups`),
  events: (fixtureId: number, homeTeamId: number) =>
    get<MatchEvent[]>(`/fixtures/${fixtureId}/events?homeTeamId=${homeTeamId}`),
  statistics: (fixtureId: number) => get<StatPair[]>(`/fixtures/${fixtureId}/statistics`),
  odds: (fixtureId: number) => get<OddsMarket[]>(`/fixtures/${fixtureId}/odds`),
  players: (pages = 4) => get<PlayerSeasonStats[]>(`/players?pages=${pages}`),
  teamPlayers: (teamId: number) => get<PlayerSeasonStats[]>(`/teams/${teamId}/players`),
};
