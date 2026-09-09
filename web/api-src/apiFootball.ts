import { config } from "./config.js";
import { cached } from "./cache.js";

const BASE_URL =
  config.mode === "rapidapi"
    ? "https://api-football-v1.p.rapidapi.com/v3"
    : "https://v3.football.api-sports.io";

function headers(): Record<string, string> {
  return config.mode === "rapidapi"
    ? { "x-rapidapi-key": config.apiKey, "x-rapidapi-host": "api-football-v1.p.rapidapi.com" }
    : { "x-apisports-key": config.apiKey };
}

export class ApiFootballError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    throw new ApiFootballError(`API-Football request failed: ${res.status} ${res.statusText}`, res.status);
  }
  const body = (await res.json()) as { response: T; errors?: unknown };
  if (body.errors && Array.isArray(body.errors) ? body.errors.length : Object.keys(body.errors ?? {}).length) {
    throw new ApiFootballError(`API-Football error: ${JSON.stringify(body.errors)}`, 502);
  }
  return body.response;
}

/** Fixtures for the configured league/season, optionally live-only or by round. */
export function getFixtures(opts: { live?: boolean; round?: string; next?: number; last?: number }) {
  const key = `fixtures:${JSON.stringify(opts)}`;
  return cached(key, opts.live ? 10_000 : 60_000, () =>
    request<unknown[]>("/fixtures", {
      league: config.leagueId,
      season: config.season,
      live: opts.live ? "all" : undefined,
      round: opts.round,
      next: opts.next,
      last: opts.last,
    })
  );
}

export function getFixtureById(fixtureId: number) {
  return cached(`fixture:${fixtureId}`, 10_000, () => request<unknown[]>("/fixtures", { id: fixtureId }));
}

export function getFixtureLineups(fixtureId: number) {
  return cached(`lineups:${fixtureId}`, 60_000, () =>
    request<unknown[]>("/fixtures/lineups", { fixture: fixtureId })
  );
}

export function getFixtureEvents(fixtureId: number) {
  return cached(`events:${fixtureId}`, 10_000, () =>
    request<unknown[]>("/fixtures/events", { fixture: fixtureId })
  );
}

export function getFixtureStatistics(fixtureId: number) {
  return cached(`stats:${fixtureId}`, 15_000, () =>
    request<unknown[]>("/fixtures/statistics", { fixture: fixtureId })
  );
}

export function getFixtureOdds(fixtureId: number) {
  return cached(`odds:${fixtureId}`, 30_000, () =>
    request<unknown[]>("/odds", { fixture: fixtureId })
  );
}

export function getPlayerStatistics(page: number) {
  return cached(`players:${page}`, 5 * 60_000, () =>
    request<unknown[]>("/players", { league: config.leagueId, season: config.season, page })
  );
}

export function getPlayersByTeam(teamId: number, page: number) {
  return cached(`players-team:${teamId}:${page}`, 5 * 60_000, () =>
    request<unknown[]>("/players", { team: teamId, season: config.season, page })
  );
}

export function searchPlayers(query: string) {
  return cached(`players-search:${query}`, 5 * 60_000, () =>
    request<unknown[]>("/players", { search: query, league: config.leagueId, season: config.season })
  );
}

export function getPlayerProfile(playerId: number) {
  return cached(`player-profile:${playerId}`, 5 * 60_000, () =>
    request<unknown[]>("/players", { id: playerId, season: config.season })
  );
}

/** The league's current round name (e.g. "League Stage - 3"), needed to ask for "this round"'s fixtures. */
export function getCurrentRound() {
  return cached(`current-round`, 5 * 60_000, () =>
    request<string[]>("/fixtures/rounds", { league: config.leagueId, season: config.season, current: "true" })
  );
}

export function getStandings() {
  return cached(`standings`, 5 * 60_000, () =>
    request<unknown[]>("/standings", { league: config.leagueId, season: config.season })
  );
}
