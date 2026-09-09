import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  // "direct" talks to v3.football.api-sports.io with an x-apisports-key header.
  // "rapidapi" talks to api-football-v1.p.rapidapi.com with rapidapi headers.
  mode: (process.env.API_FOOTBALL_MODE ?? "direct") as "direct" | "rapidapi",
  apiKey: required("API_FOOTBALL_KEY"),
  // UEFA Champions League league id in API-Football is 2.
  leagueId: Number(process.env.API_FOOTBALL_LEAGUE_ID ?? 2),
  // API-Football seasons are keyed by the year the season started.
  season: Number(process.env.API_FOOTBALL_SEASON ?? new Date().getFullYear()),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
