import { Router } from "express";
import {
  ApiFootballError,
  getCurrentRound,
  getFixtureById,
  getFixtureEvents,
  getFixtureLineups,
  getFixtureOdds,
  getFixtures,
  getFixtureStatistics,
  getPlayerStatistics,
  getPlayersByTeam,
  getStandings,
} from "./apiFootball.js";
import {
  normalizeEvents,
  normalizeFixture,
  normalizeLineups,
  normalizeOdds,
  normalizePlayerStats,
  normalizeStatistics,
  summarizeScorers,
} from "./normalize.js";
import { cached } from "./cache.js";

export const router = Router();

function handleError(res: import("express").Response, err: unknown) {
  if (err instanceof ApiFootballError) {
    res.status(err.status >= 400 && err.status < 600 ? err.status : 502).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal error" });
}

// Fixtures for the current round plus the next/previous round, so the
// fixtures list can show "tonight's matches" the way the design expects.
router.get("/fixtures", async (req, res) => {
  try {
    const round = typeof req.query.round === "string" ? req.query.round : undefined;
    const raw = await getFixtures({ round });
    res.json(raw.map(normalizeFixture));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/round/current", async (_req, res) => {
  try {
    const rounds = await getCurrentRound();
    res.json({ round: rounds[0] ?? null });
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/fixtures/live", async (_req, res) => {
  try {
    const raw = await getFixtures({ live: true });
    res.json(raw.map(normalizeFixture));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/fixtures/past", async (req, res) => {
  try {
    const last = req.query.last ? Number(req.query.last) : 10;
    const results = await cached(`past-results:${last}`, 2 * 60_000, async () => {
      const raw = await getFixtures({ last });
      return Promise.all(
        raw.map(async (r: any) => {
          const events = await getFixtureEvents(r.fixture.id);
          return { ...normalizeFixture(r), scorers: summarizeScorers(events, r.teams.home.id) };
        })
      );
    });
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/fixtures/:id", async (req, res) => {
  try {
    const raw = await getFixtureById(Number(req.params.id));
    if (raw.length === 0) {
      res.status(404).json({ error: "Fixture not found" });
      return;
    }
    res.json(normalizeFixture(raw[0]));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/fixtures/:id/lineups", async (req, res) => {
  try {
    const raw = await getFixtureLineups(Number(req.params.id));
    res.json(normalizeLineups(raw));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/fixtures/:id/events", async (req, res) => {
  try {
    const homeTeamId = Number(req.query.homeTeamId);
    const raw = await getFixtureEvents(Number(req.params.id));
    res.json(normalizeEvents(raw, homeTeamId));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/fixtures/:id/statistics", async (req, res) => {
  try {
    const raw = await getFixtureStatistics(Number(req.params.id));
    res.json(normalizeStatistics(raw));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/fixtures/:id/odds", async (req, res) => {
  try {
    const raw = await getFixtureOdds(Number(req.params.id));
    res.json(normalizeOdds(raw));
  } catch (err) {
    handleError(res, err);
  }
});

// Merges a few pages of the league's player-statistics endpoint into one
// leaderboard. API-Football paginates ~20 players per page.
router.get("/players", async (req, res) => {
  try {
    const pages = Math.min(Number(req.query.pages) || 4, 10);
    const results = await Promise.all(Array.from({ length: pages }, (_, i) => getPlayerStatistics(i + 1)));
    res.json(normalizePlayerStats(results.flat()));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/teams/:id/players", async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const [p1, p2] = await Promise.all([getPlayersByTeam(teamId, 1), getPlayersByTeam(teamId, 2)]);
    res.json(normalizePlayerStats([...p1, ...p2]));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/standings", async (_req, res) => {
  try {
    const raw = await getStandings();
    res.json(raw);
  } catch (err) {
    handleError(res, err);
  }
});
