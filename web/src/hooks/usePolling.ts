import { useEffect, useRef, useState } from "react";

interface PollingState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Fetches immediately, then re-fetches on an interval. Stale responses (from a superseded deps change) are dropped. */
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number, deps: unknown[]): PollingState<T> {
  const [state, setState] = useState<PollingState<T>>({ data: null, error: null, loading: true });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    const tick = () => {
      fetcherRef.current().then(
        (data) => {
          if (!cancelled) setState({ data, error: null, loading: false });
        },
        (err: Error) => {
          if (!cancelled) setState((s) => ({ ...s, error: err.message, loading: false }));
        }
      );
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
