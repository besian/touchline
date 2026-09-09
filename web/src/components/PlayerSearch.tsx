import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { api } from "../api";
import { TeamCrest } from "./TeamCrest";
import type { PlayerSeasonStats } from "../types";

export function PlayerSearch({ onSelect }: { onSelect: (playerId: number) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSeasonStats[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      api.searchPlayers(q).then(
        (r) => {
          if (!cancelled) setResults(r);
        },
        () => {
          if (!cancelled) setResults([]);
        }
      );
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const pick = (id: number) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    onSelect(id);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: 220 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-divider)",
          background: "var(--color-surface)",
        }}
      >
        <MagnifyingGlass size={14} color="var(--color-neutral-500)" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search players"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--color-text)",
            fontSize: 13,
            font: "inherit",
          }}
        />
      </div>

      {open && query.trim().length >= 3 && (
        <div
          className="tl-fade-in"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            maxHeight: 320,
            overflowY: "auto",
            background: "#111320",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 100,
          }}
        >
          {results.length === 0 && <p className="text-muted" style={{ fontSize: 12, padding: 12, margin: 0 }}>No players found.</p>}
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => pick(p.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                width: "100%",
                padding: "9px 12px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
              className="tl-search-result"
            >
              <TeamCrest id={p.teamId} logo="" name={p.teamName} size={18} />
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 13, color: "var(--color-text)" }}>{p.name}</span>
                <span style={{ fontSize: 10, color: "var(--color-neutral-600)" }}>
                  {p.teamName} · {p.position}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
