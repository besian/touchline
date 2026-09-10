export interface TeamRef {
  id: number;
  name: string;
  logo: string;
}

export interface PastResult extends Fixture {
  scorers: string;
}

export interface Fixture {
  id: number;
  round: string;
  competitionName?: string;
  status: string;
  elapsed: number | null;
  kickoff: string;
  home: TeamRef;
  away: TeamRef;
  goalsHome: number | null;
  goalsAway: number | null;
}

export interface MatchEvent {
  minute: number;
  extra: number | null;
  type: "goal" | "card" | "sub" | "info";
  detail: string;
  text: string;
  side: "home" | "away" | null;
}

export interface StatPair {
  label: string;
  home: number;
  away: number;
}

export interface OddsPrice {
  label: string;
  odd: number | null;
}

export interface OddsMarket {
  name: string;
  prices: OddsPrice[];
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number;
  position: string;
}

export interface Lineup {
  teamId: number;
  formation: string;
  startXI: LineupPlayer[];
}

export interface PredictedLineup extends Lineup {
  sampleSize: number;
}

export interface PlayerSeasonStats {
  id: number;
  name: string;
  photo: string;
  teamId: number;
  teamName: string;
  position: string;
  minutes: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  fouls: number;
  rating: number | null;
  passAccuracy: number | null;
}

export interface PlayerBio {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number | null;
  nationality: string;
  height: string | null;
  weight: string | null;
  photo: string;
}

export interface PlayerCompetitionStats {
  teamId: number;
  teamName: string;
  teamLogo: string;
  leagueName: string;
  leagueLogo: string;
  appearances: number;
  minutes: number;
  position: string;
  rating: number | null;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passAccuracy: number | null;
  fouls: number;
  yellowCards: number;
  redCards: number;
}

export interface PlayerProfile {
  bio: PlayerBio;
  stats: PlayerCompetitionStats[];
}

export interface PlayerMatchStats {
  id: number;
  teamId: number;
  name: string;
  number: number | null;
  position: string;
  minutes: number;
  rating: number | null;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passAccuracy: number | null;
  fouls: number;
  yellowCards: number;
  redCards: number;
}

export interface TeamProfile {
  id: number;
  name: string;
  logo: string;
  country: string;
  founded: number | null;
  venueName: string | null;
  venueCity: string | null;
}

export interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  form: string;
}

export const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "P", "BT"]);
export const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);
