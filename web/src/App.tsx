import { useState } from "react";
import { Header } from "./components/Header";
import { FixturesView } from "./components/FixturesView";
import { MatchView } from "./components/MatchView/MatchView";
import { StatsView } from "./components/StatsView";
import { BetSlip } from "./components/BetSlip";
import { Toast } from "./components/Toast";
import { BetSlipProvider } from "./state/BetSlipContext";
import { useCurrentRound } from "./hooks/useCurrentRound";

export type View = "fixtures" | "match" | "stats";

function AppShell() {
  const [view, setView] = useState<View>("fixtures");
  const [matchId, setMatchId] = useState<number | null>(null);
  const round = useCurrentRound();

  const openMatch = (id: number) => {
    setMatchId(id);
    setView("match");
  };

  return (
    <div className="tl-app">
      <Header
        view={view}
        roundLabel={round ? `Champions League · ${round}` : "Champions League"}
        onNavigate={(v) => {
          setView(v);
        }}
      />

      {view === "fixtures" && <FixturesView round={round} onOpen={openMatch} />}
      {view === "match" && matchId != null && <MatchView fixtureId={matchId} onBack={() => setView("fixtures")} />}
      {view === "stats" && <StatsView />}

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
