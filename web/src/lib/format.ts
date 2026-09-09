import type { Fixture } from "../types";
import { FINISHED_STATUSES, LIVE_STATUSES } from "../types";

export function statusInfo(f: Fixture): { text: string; isLive: boolean; isFinished: boolean } {
  if (LIVE_STATUSES.has(f.status)) {
    if (f.status === "HT") return { text: "HT", isLive: true, isFinished: false };
    return { text: `${f.elapsed ?? 0}'`, isLive: true, isFinished: false };
  }
  if (FINISHED_STATUSES.has(f.status)) return { text: "FT", isLive: false, isFinished: true };
  if (f.status === "NS") {
    const d = new Date(f.kickoff);
    return { text: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isLive: false, isFinished: false };
  }
  return { text: f.status, isLive: false, isFinished: false };
}

export function scoreText(f: Fixture): string {
  const { isLive, isFinished } = statusInfo(f);
  if (isLive || isFinished) return `${f.goalsHome ?? 0} – ${f.goalsAway ?? 0}`;
  return "vs";
}

/** A deterministic fallback tint for a team crest that hasn't loaded (or has none), so layout never shows a blank box. */
export function colorFromId(id: number): string {
  const hue = (id * 47) % 360;
  return `hsl(${hue} 32% 42%)`;
}
