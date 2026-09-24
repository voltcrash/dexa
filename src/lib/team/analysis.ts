import type { DexListEntry } from "$lib/dex/list.js";
import { defensiveProfile, effectiveness } from "$lib/pokemon/matchups.js";
import { STAT_KEYS, TYPES, type TypeName } from "$lib/pokemon/types.js";

export const TEAM_SIZE = 6;

export type TeamMember = Pick<
  DexListEntry,
  "id" | "slug" | "name" | "speciesId" | "types" | "stats"
>;

export interface DefenseRow {
  attack: TypeName;
  weak: number;
  resist: number;
  immune: number;
  /** Weak members minus members that resist or are immune. */
  balance: number;
}

export function teamDefense(team: readonly TeamMember[]): DefenseRow[] {
  const profiles = team.map((member) => defensiveProfile(member.types));
  return TYPES.map((attack) => {
    let weak = 0;
    let resist = 0;
    let immune = 0;
    for (const profile of profiles) {
      const m = profile[attack];
      if (m === 0) immune++;
      else if (m > 1) weak++;
      else if (m < 1) resist++;
    }
    return { attack, weak, resist, immune, balance: weak - resist - immune };
  });
}

/** Types that are a shared weakness: several members weak and nobody walls them. */
export function sharedWeaknesses(rows: readonly DefenseRow[], threshold = 2): TypeName[] {
  return rows.filter((r) => r.weak >= threshold && r.resist + r.immune === 0).map((r) => r.attack);
}

export interface OffenseRow {
  defend: TypeName;
  /** Members whose same-type attacks hit this type super effectively. */
  hitters: string[];
}

export function teamOffense(team: readonly TeamMember[]): OffenseRow[] {
  return TYPES.map((defend) => ({
    defend,
    hitters: team
      .filter((member) => member.types.some((t) => effectiveness(t, [defend]) > 1))
      .map((member) => member.slug),
  }));
}

export function averageStats(team: readonly TeamMember[]): number[] {
  if (team.length === 0) return STAT_KEYS.map(() => 0);
  return STAT_KEYS.map((_, i) =>
    Math.round(team.reduce((sum, m) => sum + m.stats[i], 0) / team.length),
  );
}

export function parseTeam(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((slug) => slug.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, TEAM_SIZE);
}
