import { useState } from "react";
import { Header } from "./components/Header";
import { FixturesView } from "./components/FixturesView";
import { MatchView } from "./components/MatchView/MatchView";
import { StatsView } from "./components/StatsView";
import { PlayerView } from "./components/PlayerView";
import { BetSlip } from "./components/BetSlip";
import { Toast } from "./components/Toast";
import { BetSlipProvider } from "./state/BetSlipContext";
import { useCurrentRound } from "./hooks/useCurrentRound";

export type View = "fixtures" | "match" | "stats" | "player";

function AppShell() {
  const [view, setView] = useState<View>("fixtures");
  const [matchId, setMatchId] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [returnView, setReturnView] = useState<View>("fixtures");
  const round = useCurrentRound();

  const openMatch = (id: number) => {
    setMatchId(id);
    setView("match");
  };

  const openPlayer = (id: number) => {
    setReturnView((v) => (v === "player" ? v : view));
    setPlayerId(id);
    setView("player");
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

      {view === "fixtures" && <FixturesView round={round} onOpen={openMatch} />}
      {view === "match" && matchId != null && (
        <MatchView fixtureId={matchId} onBack={() => setView("fixtures")} onSelectPlayer={openPlayer} />
      )}
      {view === "stats" && <StatsView onSelectPlayer={openPlayer} />}
      {view === "player" && playerId != null && <PlayerView playerId={playerId} onBack={() => setView(returnView)} />}

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
