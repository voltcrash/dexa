import type { DexEntry } from "$lib/data/types.js";
import { STAT_KEYS, isTypeName, type StatKey, type TypeName } from "$lib/pokemon/types.js";
import { matchScore, parseDexNumber } from "./search.js";

/** The slim entry sent to the browser for browsing and search. */
export type DexListEntry = Pick<
  DexEntry,
  | "id"
  | "slug"
  | "name"
  | "speciesId"
  | "form"
  | "isDefault"
  | "types"
  | "stats"
  | "generation"
  | "legendary"
  | "mythical"
  | "baby"
  | "final"
>;

export function toListEntry(entry: DexEntry): DexListEntry {
  const { id, slug, name, speciesId, form, isDefault, types, stats, generation } = entry;
  const { legendary, mythical, baby, final } = entry;
  return {
    id,
    slug,
    name,
    speciesId,
    form,
    isDefault,
    types,
    stats,
    generation,
    legendary,
    mythical,
    baby,
    final,
  };
}

export const TAGS = ["legendary", "mythical", "baby", "final"] as const;
export type Tag = (typeof TAGS)[number];

export const TAG_LABELS: Record<Tag, string> = {
  legendary: "Legendary",
  mythical: "Mythical",
  baby: "Baby",
  final: "Fully evolved",
};

export const SORT_KEYS = ["dex", "name", "total", ...STAT_KEYS] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export interface DexQuery {
  q: string;
  types: TypeName[];
  gens: number[];
  tags: Tag[];
  forms: boolean;
  sort: SortKey;
  desc: boolean;
}

export const DEFAULT_QUERY: DexQuery = {
  q: "",
  types: [],
  gens: [],
  tags: [],
  forms: false,
  sort: "dex",
  desc: false,
};

function csv(params: URLSearchParams, key: string): string[] {
  return (params.get(key) ?? "").split(",").filter(Boolean);
}

export function parseQuery(params: URLSearchParams): DexQuery {
  const sort = params.get("sort") ?? "dex";
  return {
    q: params.get("q") ?? "",
    types: csv(params, "type").filter(isTypeName).slice(0, 2),
    gens: csv(params, "gen")
      .map(Number)
      .filter((g) => Number.isInteger(g) && g >= 1 && g <= 9),
    tags: csv(params, "tag").filter((t): t is Tag => (TAGS as readonly string[]).includes(t)),
    forms: params.get("forms") === "1",
    sort: (SORT_KEYS as readonly string[]).includes(sort) ? (sort as SortKey) : "dex",
    desc: params.get("dir") === "desc",
  };
}

export function toSearchParams(query: DexQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.types.length) params.set("type", query.types.join(","));
  if (query.gens.length) params.set("gen", [...query.gens].sort((a, b) => a - b).join(","));
  if (query.tags.length) params.set("tag", query.tags.join(","));
  if (query.forms) params.set("forms", "1");
  if (query.sort !== "dex") params.set("sort", query.sort);
  if (query.desc) params.set("dir", "desc");
  return params;
}

export function isFiltered(query: DexQuery): boolean {
  return toSearchParams({ ...query, sort: "dex", desc: false }).size > 0;
}

export function statTotal(entry: Pick<DexListEntry, "stats">): number {
  return entry.stats.reduce((sum, stat) => sum + stat, 0);
}

function sortValue(entry: DexListEntry, sort: SortKey): number | string {
  if (sort === "dex") return entry.speciesId * 100_000 + entry.id;
  if (sort === "name") return entry.name;
  if (sort === "total") return statTotal(entry);
  return entry.stats[STAT_KEYS.indexOf(sort as StatKey)];
}

function compare(a: DexListEntry, b: DexListEntry, sort: SortKey, desc: boolean): number {
  const va = sortValue(a, sort);
  const vb = sortValue(b, sort);
  const result =
    typeof va === "string" ? va.localeCompare(vb as string) : (va as number) - (vb as number);
  if (result !== 0) return desc ? -result : result;
  return a.speciesId - b.speciesId || a.id - b.id;
}

/** Filter, search and sort entries. Search relevance wins over the chosen sort. */
export function queryDex(entries: readonly DexListEntry[], query: DexQuery): DexListEntry[] {
  const dexNumber = parseDexNumber(query.q);
  const scored: { entry: DexListEntry; score: number }[] = [];

  for (const entry of entries) {
    if (!query.forms && !entry.isDefault && !query.q) continue;
    if (query.types.some((t) => !entry.types.includes(t))) continue;
    if (query.gens.length && !query.gens.includes(entry.generation)) continue;
    if (query.tags.length && !query.tags.every((tag) => entry[tag])) continue;

    let score = 0;
    if (dexNumber !== null) {
      if (entry.speciesId !== dexNumber) continue;
    } else if (query.q) {
      const match = matchScore(query.q, entry.name);
      if (match === null) continue;
      // Alternate forms only surface for searches when forms are hidden, and rank after defaults.
      score = match * 2 + (entry.isDefault ? 0 : 1);
    }
    scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => a.score - b.score || compare(a.entry, b.entry, query.sort, query.desc))
    .map(({ entry }) => entry);
}
