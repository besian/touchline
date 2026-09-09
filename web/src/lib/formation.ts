export interface TokenPos {
  x: number;
  y: number;
}

/** Places a team's XI on the pitch as rows per the formation string (e.g. "4-3-3"), goalkeeper included as its own row. */
export function layoutFormation(formation: string, home: boolean): TokenPos[] {
  const lines = [1, ...formation.split("-").map(Number)];
  const out: TokenPos[] = [];
  lines.forEach((n, li) => {
    const t = lines.length === 1 ? 0 : li / (lines.length - 1);
    const x = home ? 5 + t * 41 : 95 - t * 41;
    for (let i = 0; i < n; i++) {
      let y = ((i + 1) / (n + 1)) * 100;
      y = 10 + (y / 100) * 80;
      out.push({ x, y: home ? y : 100 - y });
    }
  });
  return out;
}

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h;
}
