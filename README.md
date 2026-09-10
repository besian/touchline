# Touchline

A Champions League lineups & odds web app: a live fixtures list with ticking 1X2 prices, a match hub with an
animated top-down pitch (real starting XIs sliding into their real formations), a live event feed, match stats,
win-probability bar, betting markets, a slide-in bet slip with payout math, a sortable player-statistics
leaderboard, team and player profile pages, and a referees page with per-referee discipline stats (cards,
penalties, match history) derived from recent fixtures.

Implemented from a Claude Design handoff (see `chats/` and `project/` for the original design source) using the
Nocturne design system's tokens and component styles.

## Structure

Everything lives in `web/` as a single deployable project:

- `web/src/` — React + Vite + TypeScript frontend.
- `web/api-src/` — Express + TypeScript backend that proxies [API-Football](https://www.api-football.com/)
  (fixtures, lineups, live events, match statistics, odds, and player season statistics) and holds the API key
  server-side.
- `web/api/index.ts` — the one Vercel serverless function; `web/vercel.json` rewrites every `/api/*` request to
  it (with the original URL intact), and it delegates to `api-src/app.ts` for Express to route from there.
- `project/`, `chats/` — the original Claude Design handoff bundle (prototype HTML/CSS/JS, not used at runtime).

## Running it locally

```
cd web
npm install
cp .env.example .env   # fill in API_FOOTBALL_KEY (and API_FOOTBALL_MODE if you're on RapidAPI)
```

Then, in two terminals:

```
npm run dev:api    # backend on http://localhost:8787
npm run dev        # frontend on http://localhost:5173
```

`API_FOOTBALL_LEAGUE_ID` defaults to `2` (UEFA Champions League); `API_FOOTBALL_SEASON` defaults to the current
year — set it explicitly if your plan needs the season the competition actually started in (e.g. `2026` for the
2026/2027 season).

## Deploying to Vercel

One project, one import — pick `web` as the directory when Vercel asks (it auto-detects Vite; no `vercel.json`
needed). No separate backend project or `CORS_ORIGIN` juggling needed — the API is served from the same domain
as the site, at `/api/*`.

Set these environment variables on the project:

- `API_FOOTBALL_KEY` — your key
- `API_FOOTBALL_MODE` — `direct` or `rapidapi`, matching where the key is from
- `API_FOOTBALL_LEAGUE_ID`, `API_FOOTBALL_SEASON` — optional, same defaults as local
- `VITE_API_BASE_URL` — set to `/api` (same-origin, since it's all one deployment now)

Deploy, and that's it — no second project, no wiring one deployment's URL into another's.

## Notes on the data

- Fixtures, lineups, live events, match statistics, and player season statistics all come from API-Football.
- Odds come from API-Football's `/odds` endpoint (pre-match, bookmaker-sourced) — the first bookmaker in the
  response is used. That endpoint isn't a live in-play feed, so prices refresh on a polling interval (~30-45s)
  rather than ticking every couple of seconds; the UI still flashes ▲/▼ whenever a polled price has actually moved.
- The backend caches every upstream call in memory (10s–5min TTLs depending on how fast that data changes) to
  stay within API-Football's rate limits — expect a request burst on first load of a match page.
- The bet slip's stake/payout math and "place bet" action are local UI simulation only — no real wagering, payment,
  or account system is wired up.
- API-Football has no dedicated referee-stats endpoint, so referee cards/penalties/match history are aggregated
  server-side from each referee's recent fixtures and match events — the same event data the match hub uses.
  "Predicted" lineups (shown before a match's official lineup is published) are likewise a best guess from a team's
  recent starting XIs, not sourced from news or injury reports.
