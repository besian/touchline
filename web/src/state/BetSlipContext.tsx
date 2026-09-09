import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

export interface SlipItem {
  key: string;
  market: string;
  label: string;
  odds: number;
  match: string;
}

interface BetSlipState {
  slip: SlipItem[];
  slipOpen: boolean;
  stake: string;
  toast: string | null;
  addPick: (item: SlipItem) => void;
  removePick: (key: string) => void;
  toggleSlip: () => void;
  setStake: (v: string) => void;
  place: () => void;
  isSelected: (key: string) => boolean;
}

const BetSlipCtx = createContext<BetSlipState | null>(null);

export function BetSlipProvider({ children }: { children: ReactNode }) {
  const [slip, setSlip] = useState<SlipItem[]>([]);
  const [slipOpen, setSlipOpen] = useState(false);
  const [stake, setStake] = useState("10");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const addPick = useCallback((item: SlipItem) => {
    setSlip((prev) => [item, ...prev.filter((s) => s.key !== item.key)]);
    setSlipOpen(true);
  }, []);

  const removePick = useCallback((key: string) => {
    setSlip((prev) => prev.filter((s) => s.key !== key));
  }, []);

  const toggleSlip = useCallback(() => setSlipOpen((v) => !v), []);

  const place = useCallback(() => {
    setSlip((currentSlip) => {
      if (currentSlip.length === 0) return currentSlip;
      const combo = currentSlip.reduce((a, x) => a * x.odds, 1);
      const stakeNum = parseFloat(stake) || 0;
      clearTimeout(toastTimer.current);
      setToast(`Bet placed — €${(stakeNum * combo).toFixed(2)} to return`);
      toastTimer.current = setTimeout(() => setToast(null), 2600);
      setSlipOpen(false);
      return [];
    });
  }, [stake]);

  const isSelected = useCallback((key: string) => slip.some((s) => s.key === key), [slip]);

  const value = useMemo(
    () => ({ slip, slipOpen, stake, toast, addPick, removePick, toggleSlip, setStake, place, isSelected }),
    [slip, slipOpen, stake, toast, addPick, removePick, toggleSlip, place, isSelected]
  );

  return <BetSlipCtx.Provider value={value}>{children}</BetSlipCtx.Provider>;
}

export function useBetSlip(): BetSlipState {
  const ctx = useContext(BetSlipCtx);
  if (!ctx) throw new Error("useBetSlip must be used within BetSlipProvider");
  return ctx;
}
