import type { DexListEntry } from "#lib/dex/list.js";
import { effectiveness } from "./matchups.js";
import type { BaseStats, TypeName } from "./types.js";

type Stats = Pick<DexListEntry, "stats">;

function total(stats: BaseStats): number {
  return stats.reduce((sum, s) => sum + s, 0);
}

/** Sorted values of each stat (and the total, last) across a population, for percentile lookups. */
export function statDistribution(population: readonly Stats[]): number[][] {
  const columns = Array.from({ length: 7 }, () => [] as number[]);
  for (const { stats } of population) {
    stats.forEach((value, i) => columns[i].push(value));
    columns[6].push(total(stats));
  }
  return columns.map((column) => column.sort((a, b) => a - b));
}

/** Share of the population, 0–100, with a strictly lower value. */
export function percentBelow(value: number, sorted: readonly number[]): number {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (sorted[mid] < value) low = mid + 1;
    else high = mid;
  }
  return sorted.length ? Math.round((low / sorted.length) * 100) : 0;
}

/** Percent of the population each stat beats, in STAT_KEYS order, then the total. */
export function statPercentiles(stats: BaseStats, distribution: readonly number[][]): number[] {
  return [...stats, total(stats)].map((value, i) => percentBelow(value, distribution[i]));
}

export interface StatTwin<T> {
  entry: T;
  /** Average gap per base stat. */
  gap: number;
}

/** Pokémon of other species whose six base stats sit closest to these. */
export function closestStats<T extends Stats & Pick<DexListEntry, "speciesId">>(
  target: Stats & Pick<DexListEntry, "speciesId">,
  population: readonly T[],
  count = 6,
): StatTwin<T>[] {
  return population
    .filter((other) => other.speciesId !== target.speciesId)
    .map((entry) => {
      const squares = entry.stats.reduce((sum, s, i) => sum + (s - target.stats[i]) ** 2, 0);
      const gap = entry.stats.reduce((sum, s, i) => sum + Math.abs(s - target.stats[i]), 0) / 6;
      return { entry, squares, gap: Math.round(gap) };
    })
    .sort((a, b) => a.squares - b.squares || a.entry.speciesId - b.entry.speciesId)
    .slice(0, count)
    .map(({ entry, gap }) => ({ entry, gap }));
}

export interface Counter<T> {
  entry: T;
  /** The counter's best same-type attack against the target. */
  attack: { type: TypeName; multiplier: number };
  /** Worst multiplier the target's same-type attacks deal to the counter. */
  takes: number;
}

type Typed = Pick<DexListEntry, "types" | "stats">;

/**
 * Pokémon that resist or ignore every one of the target's same-type attacks and hit it super
 * effectively with one of their own. Judged on types and base stats only.
 */
export function findCounters<T extends Typed>(
  target: Pick<DexListEntry, "types">,
  pool: readonly T[],
  count = 6,
): Counter<T>[] {
  const found: (Counter<T> & { power: number })[] = [];
  for (const entry of pool) {
    const takes = Math.max(...target.types.map((t) => effectiveness(t, entry.types)));
    if (takes >= 1) continue;
    let attack = { type: entry.types[0], multiplier: 0 };
    for (const type of entry.types) {
      const multiplier = effectiveness(type, target.types);
      if (multiplier > attack.multiplier) attack = { type, multiplier };
    }
    if (attack.multiplier < 2) continue;
    found.push({ entry, attack, takes, power: total(entry.stats) });
  }
  return found
    .sort(
      (a, b) => b.attack.multiplier - a.attack.multiplier || a.takes - b.takes || b.power - a.power,
    )
    .slice(0, count)
    .map(({ entry, attack, takes }) => ({ entry, attack, takes }));
}

const WEIGHTS = [
  { kg: 0.15, one: "an apple", many: "apples" },
  { kg: 1, one: "a bag of sugar", many: "bags of sugar" },
  { kg: 4, one: "a house cat", many: "house cats" },
  { kg: 7, one: "a bowling ball", many: "bowling balls" },
  { kg: 30, one: "a Labrador", many: "Labradors" },
  { kg: 70, one: "an adult person", many: "adult people" },
  { kg: 190, one: "a lion", many: "lions" },
  { kg: 400, one: "a grand piano", many: "grand pianos" },
  { kg: 700, one: "a dairy cow", many: "dairy cows" },
  { kg: 1000, one: "a small car", many: "small cars" },
] as const;

/** An everyday comparison for a weight in hectograms, e.g. "About as heavy as a house cat". */
export function weightComparison(hectograms: number): string {
  const kg = hectograms / 10;
  const reference = WEIGHTS.findLast((w) => w.kg <= kg * 1.25);
  if (!reference) return `Lighter than ${WEIGHTS[0].one}`;
  const times = Math.round(kg / reference.kg);
  if (times <= 1) return `About as heavy as ${reference.one}`;
  return `About as heavy as ${times} ${reference.many}`;
}
