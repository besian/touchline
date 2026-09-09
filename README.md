# Touchline

A Champions League lineups & odds web app: a live fixtures list with ticking 1X2 prices, a match hub with an
animated top-down pitch (real starting XIs sliding into their real formations), a live event feed, match stats,
win-probability bar, betting markets, a slide-in bet slip with payout math, and a sortable player-statistics
leaderboard.

Implemented from a Claude Design handoff (see `chats/` and `project/` for the original design source) using the
Nocturne design system's tokens and component styles.

## Structure

- `web/` — React + Vite + TypeScript frontend.
- `server/` — Express + TypeScript backend that proxies [API-Football](https://www.api-football.com/) (fixtures,
  lineups, live events, match statistics, odds, and player season statistics) and holds the API key server-side.
- `project/`, `chats/` — the original Claude Design handoff bundle (prototype HTML/CSS/JS, not used at runtime).

## Running it

### 1. Backend

```
cd server
cp .env.example .env   # fill in API_FOOTBALL_KEY (and API_FOOTBALL_MODE if you're on RapidAPI)
npm install
npm run dev
```

Runs on `http://localhost:8787`. `API_FOOTBALL_LEAGUE_ID` defaults to `2` (UEFA Champions League);
`API_FOOTBALL_SEASON` defaults to the current year — set it explicitly if your plan needs the season the
competition actually started in (e.g. `2026` for the 2026/2027 season).

### 2. Frontend

```
cd web
cp .env.example .env   # only needed if the backend isn't on localhost:8787
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Deploying to Vercel

This is two separate Vercel projects sharing the one repo — one per subfolder, each with its own URL.

### 1. Backend (`server/`)

Create a Vercel project with **Root Directory** set to `server`. It ships as a serverless function
(`api/[...path].ts` behind `vercel.json`'s `buildCommand: npm run build`, which compiles `src/` to `dist/` first) —
no framework preset needed ("Other" is fine).

Set these environment variables on the project:

- `API_FOOTBALL_KEY` — your key
- `API_FOOTBALL_MODE` — `direct` or `rapidapi`, matching where the key is from
- `API_FOOTBALL_LEAGUE_ID`, `API_FOOTBALL_SEASON` — optional, same defaults as local
- `CORS_ORIGIN` — the frontend's Vercel URL (set this after step 2, then redeploy)

Deploy it (`vercel --cwd server` with the CLI, or import the repo in the dashboard and point Root Directory at
`server`). Note the resulting URL, e.g. `https://touchline-api.vercel.app`.

### 2. Frontend (`web/`)

Create a second Vercel project with **Root Directory** set to `web` (Vercel auto-detects the Vite framework).

Set `VITE_API_BASE_URL` to the backend URL from step 1 plus `/api`, e.g.
`https://touchline-api.vercel.app/api`.

Deploy it (`vercel --cwd web`, or via the dashboard). Then go back to the backend project's `CORS_ORIGIN` and
set it to this frontend URL, and redeploy the backend so the browser is actually allowed to call it.

## Notes on the data

- Fixtures, lineups, live events, match statistics, and player season statistics all come from API-Football.
- Odds come from API-Football's `/odds` endpoint (pre-match, bookmaker-sourced) — the first bookmaker in the
  response is used. That endpoint isn't a live in-play feed, so prices refresh on a polling interval (~30-45s)
  rather than ticking every couple of seconds; the UI still flashes ▲/▼ whenever a polled price has actually moved.
- The backend caches every upstream call in memory (10s–5min TTLs depending on how fast that data changes) to
  stay within API-Football's rate limits — expect a request burst on first load of a match page.
- The bet slip's stake/payout math and "place bet" action are local UI simulation only — no real wagering, payment,
  or account system is wired up.
