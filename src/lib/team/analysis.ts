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

export interface Suggestion<T> {
  entry: T;
  /** Types the team is exposed to that this Pokémon resists or ignores. */
  covers: TypeName[];
  /** Types no member hits super effectively that this Pokémon's own types do. */
  hits: TypeName[];
}

/**
 * Rank Pokémon by how much they patch a team: resisting the attacks the team is most exposed
 * to, hitting types the team can't, and not piling onto an existing weakness.
 */
export function suggestTeammates<T extends TeamMember>(
  team: readonly TeamMember[],
  pool: readonly T[],
  count = 6,
): Suggestion<T>[] {
  if (team.length === 0 || team.length >= TEAM_SIZE) return [];
  const exposure = new Map(teamDefense(team).map((row) => [row.attack, row.balance]));
  const uncovered = teamOffense(team)
    .filter((row) => row.hitters.length === 0)
    .map((row) => row.defend);
  const species = new Set(team.map((m) => m.speciesId));

  const scored: (Suggestion<T> & { score: number })[] = [];
  for (const entry of pool) {
    if (species.has(entry.speciesId)) continue;
    const profile = defensiveProfile(entry.types);
    let score = 0;
    const covers: TypeName[] = [];
    for (const attack of TYPES) {
      const balance = exposure.get(attack) ?? 0;
      const m = profile[attack];
      if (balance > 0 && m < 1) {
        score += balance * (m === 0 ? 1.25 : 1);
        covers.push(attack);
      } else if (m > 1) {
        // Another weakness hurts most where the team is already exposed.
        score -= balance > 0 ? balance : balance === 0 ? 0.25 : 0;
      }
    }
    const hits = uncovered.filter((defend) =>
      entry.types.some((t) => effectiveness(t, [defend]) > 1),
    );
    score += hits.length * 0.75;
    if (covers.length === 0 && hits.length === 0) continue;
    const total = entry.stats.reduce((sum, s) => sum + s, 0);
    scored.push({ entry, covers, hits, score: score + (total - 500) / 200 });
  }
  // Pick greedily, marking down types already suggested so the list offers real alternatives.
  const picked: Suggestion<T>[] = [];
  const seen = new Map<TypeName, number>();
  while (picked.length < count && scored.length) {
    let best = 0;
    let bestScore = -Infinity;
    scored.forEach((s, i) => {
      const repeat = s.entry.types.reduce((sum, t) => sum + (seen.get(t) ?? 0), 0);
      const value = s.score - repeat * 0.6;
      if (
        value > bestScore ||
        (value === bestScore && s.entry.speciesId < scored[best].entry.speciesId)
      ) {
        [best, bestScore] = [i, value];
      }
    });
    const [{ entry, covers, hits }] = scored.splice(best, 1);
    picked.push({ entry, covers, hits });
    for (const t of entry.types) seen.set(t, (seen.get(t) ?? 0) + 1);
  }
  return picked;
}
