import { useEffect, useRef, useState } from "react";

type DriftMap = Record<string, 1 | -1>;

/** Flags prices that moved since the last poll so the UI can flash a ▲/▼ marker, the way live odds feeds read. */
export function usePriceDrift(values: Record<string, number | null>): DriftMap {
  const prevRef = useRef<Record<string, number | null>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [drift, setDrift] = useState<DriftMap>({});
  const serialized = JSON.stringify(values);

  useEffect(() => {
    const next: DriftMap = {};
    for (const [k, v] of Object.entries(values)) {
      const prev = prevRef.current[k];
      if (prev != null && v != null && v !== prev) next[k] = v > prev ? 1 : -1;
    }
    prevRef.current = values;
    if (Object.keys(next).length > 0) {
      setDrift(next);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setDrift({}), 1400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return drift;
}
