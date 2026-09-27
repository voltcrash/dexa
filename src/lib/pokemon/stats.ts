import type { BaseStats } from "./types.js";

export const MAX_BASE_STAT = 255;

/**
 * Stat at a level with the given IV/EV and nature multiplier (main-series formula).
 * Shedinja is the lone special case: its HP is always 1.
 */
export function statAt(
  base: number,
  {
    level,
    iv,
    ev,
    nature = 1,
    isHp = false,
  }: { level: number; iv: number; ev: number; nature?: number; isHp?: boolean },
): number {
  const core = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100);
  if (isHp) return base === 1 ? 1 : core + level + 10;
  return Math.floor((core + 5) * nature);
}

/** Lowest and highest possible value of each stat at a level. */
export function statRanges(stats: BaseStats, level: number): [number, number][] {
  return stats.map((base, index) => {
    const isHp = index === 0;
    return [
      statAt(base, { level, iv: 0, ev: 0, nature: isHp ? 1 : 0.9, isHp }),
      statAt(base, { level, iv: 31, ev: 252, nature: isHp ? 1 : 1.1, isHp }),
    ];
  });
}

/** Lower bound of each rating band, from poor (1) to exceptional (6). */
const STAT_BANDS = [0, 50, 80, 100, 120, 150] as const;

/** Rating band of a base stat, used to color stat bars from 1 (poor) to 6 (exceptional). */
export function statBand(base: number): 1 | 2 | 3 | 4 | 5 | 6 {
  let band = 1;
  for (let i = 0; i < STAT_BANDS.length; i++) if (base >= STAT_BANDS[i]) band = i + 1;
  return band as 1 | 2 | 3 | 4 | 5 | 6;
}
