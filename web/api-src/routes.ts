import { Router } from "express";
import {
  ApiFootballError,
  getCurrentRound,
  getFixtureById,
  getFixtureEvents,
  getFixtureLineups,
  getFixtureOdds,
  getFixturePlayerStats,
  getFixtures,
  getFixtureStatistics,
  getPlayerProfile,
  getPlayerStatistics,
  getPlayersByTeam,
  getStandings,
  getTeamFixtures,
  getTeamProfile,
  getTeamStatistics,
  searchPlayers,
} from "./apiFootball.js";
import {
  normalizeEvents,
  normalizeFixture,
  normalizeFixturePlayerStats,
  normalizeLineups,
  normalizeOdds,
  normalizePlayerProfile,
  normalizePlayerStats,
  normalizeStatistics,
  normalizeTeamProfile,
  normalizeTeamStats,
  predictLineup,
  summarizeDiscipline,
  summarizeScorers,
} from "./normalize.js";
import { cached } from "./cache.js";

export const router = Router();

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

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

router.get("/fixtures/:id/players", async (req, res) => {
  try {
    const raw = await getFixturePlayerStats(Number(req.params.id));
    res.json(normalizeFixturePlayerStats(raw));
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

router.get("/players/search", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q.length < 3) {
      res.json([]);
      return;
    }
    const raw = await searchPlayers(q);
    res.json(normalizePlayerStats(raw));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/players/:id", async (req, res) => {
  try {
    const season = req.query.season ? Number(req.query.season) : undefined;
    const raw = await getPlayerProfile(Number(req.params.id), season);
    if (raw.length === 0) {
      res.status(404).json({ error: "Player not found" });
      return;
    }
    res.json(normalizePlayerProfile(raw[0]));
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

// Best-effort predicted XI from a team's recent lineups, for fixtures where
// the real lineup hasn't been published yet. Not based on news/injuries -
// there's no such feed here, just recent starting-XI frequency.
router.get("/teams/:id/predicted-lineup", async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const result = await cached(`predicted-lineup:${teamId}`, 30 * 60_000, async () => {
      const recentFixtures = await getTeamFixtures(teamId, 8);
      const finishedIds = recentFixtures
        .filter((r: any) => ["FT", "AET", "PEN"].includes(r.fixture.status.short))
        .map((r: any) => r.fixture.id)
        .slice(0, 5);
      const lineupsPerFixture = await Promise.all(finishedIds.map((id: number) => getFixtureLineups(id)));
      return predictLineup(lineupsPerFixture, teamId);
    });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/teams/:id/statistics", async (req, res) => {
  try {
    const raw = await getTeamStatistics(Number(req.params.id));
    res.json(normalizeTeamStats(raw));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/teams/:id/fixtures", async (req, res) => {
  try {
    const last = req.query.last ? Number(req.query.last) : 10;
    const raw = await getTeamFixtures(Number(req.params.id), last);
    res.json(raw.map(normalizeFixture));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/teams/:id", async (req, res) => {
  try {
    const raw = await getTeamProfile(Number(req.params.id));
    if (raw.length === 0) {
      res.status(404).json({ error: "Team not found" });
      return;
    }
    res.json(normalizeTeamProfile(raw[0]));
  } catch (err) {
    handleError(res, err);
  }
});

// API-Football has no dedicated referee-stats endpoint - these derive real
// per-referee card/penalty counts from recent fixtures' events, the same
// data source /fixtures/past uses for scorers.
router.get("/referees", async (req, res) => {
  try {
    const last = req.query.last ? Number(req.query.last) : 40;
    const summaries = await cached(`referees:${last}`, 5 * 60_000, async () => {
      const raw = await getFixtures({ last });
      const finished = raw.filter(
        (r: any) => FINISHED_STATUSES.has(r.fixture.status.short) && r.fixture.referee
      );
      const byReferee = new Map<string, { yellowCards: number; redCards: number; penalties: number; matches: number }>();
      await Promise.all(
        finished.map(async (r: any) => {
          const name = String(r.fixture.referee).trim();
          const events = await getFixtureEvents(r.fixture.id);
          const d = summarizeDiscipline(events);
          const entry = byReferee.get(name) ?? { yellowCards: 0, redCards: 0, penalties: 0, matches: 0 };
          entry.yellowCards += d.yellowCards;
          entry.redCards += d.redCards;
          entry.penalties += d.penalties;
          entry.matches += 1;
          byReferee.set(name, entry);
        })
      );
      return Array.from(byReferee.entries())
        .map(([name, s]) => ({
          name,
          matches: s.matches,
          yellowCards: s.yellowCards,
          redCards: s.redCards,
          penalties: s.penalties,
          avgYellowPerMatch: s.matches ? s.yellowCards / s.matches : 0,
          avgRedPerMatch: s.matches ? s.redCards / s.matches : 0,
          avgCardsPerMatch: s.matches ? (s.yellowCards + s.redCards) / s.matches : 0,
        }))
        .sort((a, b) => b.matches - a.matches);
    });
    res.json(summaries);
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/referees/:name", async (req, res) => {
  try {
    const targetName = decodeURIComponent(req.params.name);
    const last = req.query.last ? Number(req.query.last) : 40;
    const result = await cached(`referee-detail:${targetName}:${last}`, 5 * 60_000, async () => {
      const raw = await getFixtures({ last });
      const finished = raw.filter(
        (r: any) =>
          FINISHED_STATUSES.has(r.fixture.status.short) &&
          r.fixture.referee &&
          String(r.fixture.referee).trim() === targetName
      );
      const matchHistory = await Promise.all(
        finished.map(async (r: any) => {
          const events = await getFixtureEvents(r.fixture.id);
          const d = summarizeDiscipline(events);
          const f = normalizeFixture(r);
          return {
            fixtureId: f.id,
            round: f.round,
            competitionName: f.competitionName,
            kickoff: f.kickoff,
            status: f.status,
            home: f.home,
            away: f.away,
            goalsHome: f.goalsHome,
            goalsAway: f.goalsAway,
            ...d,
          };
        })
      );
      const totals = matchHistory.reduce(
        (acc, m) => ({
          yellowCards: acc.yellowCards + m.yellowCards,
          redCards: acc.redCards + m.redCards,
          penalties: acc.penalties + m.penalties,
        }),
        { yellowCards: 0, redCards: 0, penalties: 0 }
      );
      const matches = matchHistory.length;
      return {
        name: targetName,
        matches,
        yellowCards: totals.yellowCards,
        redCards: totals.redCards,
        penalties: totals.penalties,
        avgYellowPerMatch: matches ? totals.yellowCards / matches : 0,
        avgRedPerMatch: matches ? totals.redCards / matches : 0,
        avgCardsPerMatch: matches ? (totals.yellowCards + totals.redCards) / matches : 0,
        matchHistory: matchHistory.sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime()),
      };
    });
    if (result.matches === 0) {
      res.status(404).json({ error: "Referee not found" });
      return;
    }
    res.json(result);
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
