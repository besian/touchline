import { useState } from "react";
import { Header } from "./components/Header";
import { FixturesView } from "./components/FixturesView";
import { MatchView } from "./components/MatchView/MatchView";
import { StatsView } from "./components/StatsView";
import { PlayerView } from "./components/PlayerView";
import { TeamView } from "./components/TeamView";
import { BetSlip } from "./components/BetSlip";
import { Toast } from "./components/Toast";
import { BetSlipProvider } from "./state/BetSlipContext";
import { useCurrentRound } from "./hooks/useCurrentRound";

export type View = "fixtures" | "match" | "stats" | "player" | "team";

const OVERLAY_VIEWS: View[] = ["player", "team", "match"];

function AppShell() {
  const [view, setView] = useState<View>("fixtures");
  const [matchId, setMatchId] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [returnView, setReturnView] = useState<View>("fixtures");
  const round = useCurrentRound();

  const openMatch = (id: number) => {
    setReturnView((v) => (OVERLAY_VIEWS.includes(view) ? v : view));
    setMatchId(id);
    setView("match");
  };

  const openPlayer = (id: number) => {
    setReturnView((v) => (OVERLAY_VIEWS.includes(view) ? v : view));
    setPlayerId(id);
    setView("player");
  };

  const openTeam = (id: number) => {
    setReturnView((v) => (OVERLAY_VIEWS.includes(view) ? v : view));
    setTeamId(id);
    setView("team");
  };

  return (
    <div className="tl-app">
      <Header
        view={view}
        roundLabel={round ? `Champions League · ${round}` : "Champions League"}
        onNavigate={(v) => {
          setView(v);
        }}
        onSelectPlayer={openPlayer}
      />

      {view === "fixtures" && <FixturesView round={round} onOpen={openMatch} onSelectTeam={openTeam} />}
      {view === "match" && matchId != null && (
        <MatchView fixtureId={matchId} onBack={() => setView(returnView)} onSelectPlayer={openPlayer} onSelectTeam={openTeam} />
      )}
      {view === "stats" && <StatsView onSelectPlayer={openPlayer} onSelectTeam={openTeam} onOpenMatch={openMatch} />}
      {view === "player" && playerId != null && (
        <PlayerView playerId={playerId} onBack={() => setView(returnView)} onSelectTeam={openTeam} />
      )}
      {view === "team" && teamId != null && (
        <TeamView
          teamId={teamId}
          onBack={() => setView(returnView)}
          onSelectPlayer={openPlayer}
          onSelectTeam={openTeam}
          onOpenMatch={openMatch}
        />
      )}

      <BetSlip />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BetSlipProvider>
      <AppShell />
    </BetSlipProvider>
  );
}
