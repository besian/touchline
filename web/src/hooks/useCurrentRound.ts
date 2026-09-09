import { useEffect, useState } from "react";
import { api } from "../api";

/** The league's current round name (e.g. "League Stage - 3"), fetched once and shared. */
export function useCurrentRound(): string | null | undefined {
  const [round, setRound] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    api.currentRound().then(
      (r) => setRound(r.round),
      () => setRound(null)
    );
  }, []);
  return round;
}
