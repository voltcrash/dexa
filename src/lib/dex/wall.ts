import { STAT_KEYS, TYPES, type StatKey, type TypeName } from "#lib/pokemon/types.js";
import { statBand } from "#lib/pokemon/stats.js";
import { statTotal, type DexListEntry } from "./list.js";

export const WALL_COLORS = ["type", "total", ...STAT_KEYS] as const;
export type WallColor = (typeof WALL_COLORS)[number];

export function isWallColor(value: string | null): value is WallColor {
  return (WALL_COLORS as readonly (string | null)[]).includes(value);
}

/**
 * Types of every species in dex order, two characters each (second is "-" when single-typed),
 * so the server can paint the wall before the full index reaches the browser.
 */
export function encodeWallTypes(entries: readonly Pick<DexListEntry, "types">[]): string {
  const code = (type: TypeName | undefined) =>
    type ? String.fromCharCode(97 + TYPES.indexOf(type)) : "-";
  return entries.map(({ types }) => code(types[0]) + code(types[1])).join("");
}

export function decodeWallTypes(code: string): TypeName[][] {
  const out: TypeName[][] = [];
  for (let i = 0; i < code.length; i += 2) {
    const types: TypeName[] = [];
    for (const char of code.slice(i, i + 2)) {
      const type = TYPES[char.charCodeAt(0) - 97];
      if (type) types.push(type);
    }
    out.push(types);
  }
  return out;
}

/** Lower bound of each base stat total band, matching the six single-stat rating bands. */
const TOTAL_BANDS = [0, 300, 400, 480, 540, 600] as const;

export function totalBand(total: number): 1 | 2 | 3 | 4 | 5 | 6 {
  let band = 1;
  for (let i = 0; i < TOTAL_BANDS.length; i++) if (total >= TOTAL_BANDS[i]) band = i + 1;
  return band as 1 | 2 | 3 | 4 | 5 | 6;
}

/** Legend thresholds for a heat color mode, poor to exceptional. */
export function heatThresholds(color: Exclude<WallColor, "type">): readonly number[] {
  return color === "total" ? TOTAL_BANDS : [0, 50, 80, 100, 120, 150];
}

export function heatBand(entry: Pick<DexListEntry, "stats">, color: Exclude<WallColor, "type">) {
  if (color === "total") return totalBand(statTotal(entry));
  return statBand(entry.stats[STAT_KEYS.indexOf(color as StatKey)]);
}
