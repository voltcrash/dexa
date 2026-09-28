import { effectiveness } from "$lib/pokemon/matchups.js";
import { isRoleTerm, roleMatches, statRole } from "$lib/pokemon/role.js";
import { GENERATIONS } from "$lib/pokemon/generations.js";
import { titleCase } from "$lib/pokemon/format.js";
import {
  STAT_KEYS,
  STAT_LABELS,
  isTypeName,
  type StatKey,
  type TypeName,
} from "$lib/pokemon/types.js";
import type { DexListEntry } from "./list.js";
import { normalize } from "./search.js";

export type Comparison = ">" | ">=" | "<" | "<=" | "=";

export const IS_FLAGS = [
  "legendary",
  "mythical",
  "baby",
  "final",
  "mega",
  "gmax",
  "regional",
  "form",
  "mono",
  "dual",
] as const;
export type IsFlag = (typeof IS_FLAGS)[number];

type Measure = StatKey | "total" | "height" | "weight";

type FilterBody =
  | { kind: "measure"; measure: Measure; op: Comparison; value: number }
  | { kind: "type"; type: TypeName }
  | { kind: "weak" | "resist" | "immune"; type: TypeName }
  | { kind: "gen"; from: number; to: number }
  | { kind: "is"; flag: IsFlag }
  | { kind: "ability"; slug: string }
  | { kind: "role"; term: string };

/** A filter read from a search, with the token it came from. */
export type Filter = FilterBody & { raw: string; negate: boolean };

export interface ParsedSearch {
  /** Words that are not filters, matched against names and dex numbers. */
  text: string;
  filters: Filter[];
  /** Tokens that look like filters but could not be read. */
  invalid: string[];
}

const MEASURES: Record<string, Measure> = {
  hp: "hp",
  atk: "attack",
  attack: "attack",
  def: "defense",
  defense: "defense",
  spa: "special-attack",
  spatk: "special-attack",
  satk: "special-attack",
  spd: "special-defense",
  spdef: "special-defense",
  sdef: "special-defense",
  spe: "speed",
  speed: "speed",
  bst: "total",
  total: "total",
  height: "height",
  ht: "height",
  weight: "weight",
  wt: "weight",
};

type Key = "type" | "weak" | "resist" | "immune" | "gen" | "is" | "ability" | "role";

const KEYS: Record<string, Key> = {
  type: "type",
  t: "type",
  weak: "weak",
  w: "weak",
  resist: "resist",
  resists: "resist",
  r: "resist",
  immune: "immune",
  gen: "gen",
  g: "gen",
  is: "is",
  ability: "ability",
  a: "ability",
  role: "role",
};

const IS_ALIASES: Record<string, IsFlag> = {
  legendary: "legendary",
  legend: "legendary",
  mythical: "mythical",
  mythic: "mythical",
  baby: "baby",
  final: "final",
  fe: "final",
  fullyevolved: "final",
  mega: "mega",
  gmax: "gmax",
  gigantamax: "gmax",
  regional: "regional",
  form: "form",
  mono: "mono",
  single: "mono",
  dual: "dual",
};

const MEASURE_PATTERN = /^([a-z]+):?(>=|<=|>|<|=)?(\d+(?:\.\d+)?)$/;

/** Split on spaces, keeping quoted values such as ability:"water absorb" together. */
function tokenize(q: string): string[] {
  return q.match(/[^\s"]*"[^"]*"?[^\s"]*|\S+/g) ?? [];
}

function parseGen(value: string): { from: number; to: number } | null {
  const one = (v: string) => {
    if (/^\d$/.test(v)) return Number(v);
    const gen = GENERATIONS.find(
      (g) => g.numeral.toLowerCase() === v || g.region.toLowerCase() === v,
    );
    return gen?.id ?? NaN;
  };
  const [a, b = a] = value.split("-");
  const from = one(a);
  const to = one(b);
  if (!(from >= 1 && to <= 9 && from <= to)) return null;
  return { from, to };
}

function parseToken(token: string): FilterBody | null | undefined {
  const lower = token.toLowerCase();

  const measure = MEASURE_PATTERN.exec(lower);
  if (measure && MEASURES[measure[1]]) {
    return {
      kind: "measure",
      measure: MEASURES[measure[1]],
      op: (measure[2] as Comparison | undefined) ?? "=",
      value: Number(measure[3]),
    };
  }

  const colon = lower.indexOf(":");
  if (colon < 1) return undefined;
  const key = KEYS[lower.slice(0, colon)];
  const value = lower
    .slice(colon + 1)
    .replace(/"/g, "")
    .trim();
  if (!key) return MEASURES[lower.slice(0, colon)] ? null : undefined;
  // "Type: Null" is a Pokémon, so a key with nothing after it is plain text.
  if (!value) return undefined;

  switch (key) {
    case "type":
    case "weak":
    case "resist":
    case "immune":
      return isTypeName(value) ? { kind: key, type: value } : null;
    case "gen": {
      const range = parseGen(value);
      return range && { kind: "gen", ...range };
    }
    case "is": {
      const flag = IS_ALIASES[normalize(value)];
      return flag ? { kind: "is", flag } : null;
    }
    case "ability":
      return { kind: "ability", slug: value.replace(/[\s_]+/g, "-") };
    case "role":
      return isRoleTerm(value) ? { kind: "role", term: value.replace(/[\s_]+/g, "-") } : null;
  }
}

/**
 * Read filters out of a search, e.g. `spe>100 type:fire -is:legendary char`.
 * Anything that is not a filter stays in `text` for the name search.
 */
export function parseSearch(q: string): ParsedSearch {
  const words: string[] = [];
  const filters: Filter[] = [];
  const invalid: string[] = [];
  for (const raw of tokenize(q)) {
    const negate = /^[-!]./.test(raw);
    const token = negate ? raw.slice(1) : raw;
    const parsed = parseToken(token);
    if (parsed === undefined) words.push(raw);
    else if (parsed === null) invalid.push(raw);
    else filters.push({ ...parsed, raw, negate });
  }
  return { text: words.join(" "), filters, invalid };
}

function measureOf(entry: DexListEntry, measure: Measure): number {
  if (measure === "total") return entry.stats.reduce((sum, s) => sum + s, 0);
  // Height is stored in decimetres and weight in hectograms; filters use metres and kilograms.
  if (measure === "height") return entry.height / 10;
  if (measure === "weight") return entry.weight / 10;
  return entry.stats[STAT_KEYS.indexOf(measure)];
}

function compare(a: number, op: Comparison, b: number): boolean {
  if (op === ">") return a > b;
  if (op === ">=") return a >= b;
  if (op === "<") return a < b;
  if (op === "<=") return a <= b;
  return a === b;
}

const REGIONAL = /^(Alolan|Galarian|Hisuian|Paldean)\b/;

function hasFlag(entry: DexListEntry, flag: IsFlag): boolean {
  switch (flag) {
    case "legendary":
    case "mythical":
    case "baby":
    case "final":
      return entry[flag];
    case "mega":
      return /^(Mega|Primal)\b/.test(entry.form ?? "");
    case "gmax":
      return entry.form === "Gigantamax";
    case "regional":
      return REGIONAL.test(entry.form ?? "");
    case "form":
      return !entry.isDefault;
    case "mono":
      return entry.types.length === 1;
    case "dual":
      return entry.types.length === 2;
  }
}

function test(entry: DexListEntry, filter: Filter): boolean {
  switch (filter.kind) {
    case "measure":
      return compare(measureOf(entry, filter.measure), filter.op, filter.value);
    case "type":
      return entry.types.includes(filter.type);
    case "weak":
      return effectiveness(filter.type, entry.types) > 1;
    case "resist": {
      const m = effectiveness(filter.type, entry.types);
      return m > 0 && m < 1;
    }
    case "immune":
      return effectiveness(filter.type, entry.types) === 0;
    case "gen":
      return entry.generation >= filter.from && entry.generation <= filter.to;
    case "is":
      return hasFlag(entry, filter.flag);
    case "ability":
      return entry.abilities.some((slug) => normalize(slug) === normalize(filter.slug));
    case "role":
      return roleMatches(statRole(entry.stats), filter.term);
  }
}

export function matchesFilters(entry: DexListEntry, filters: readonly Filter[]): boolean {
  return filters.every((filter) => test(entry, filter) !== filter.negate);
}

/** Filters that only alternate forms can satisfy, so forms must be searched. */
export function wantsForms(filters: readonly Filter[]): boolean {
  return filters.some(
    (f) => f.kind === "is" && !f.negate && ["mega", "gmax", "regional", "form"].includes(f.flag),
  );
}

const OP_WORDS: Record<Comparison, string> = {
  ">": "above",
  ">=": "at least",
  "<": "below",
  "<=": "at most",
  "=": "exactly",
};

const FLAG_LABELS: Record<IsFlag, string> = {
  legendary: "Legendary",
  mythical: "Mythical",
  baby: "Baby",
  final: "Fully evolved",
  mega: "Mega Evolution",
  gmax: "Gigantamax",
  regional: "Regional form",
  form: "Alternate form",
  mono: "Single type",
  dual: "Dual type",
};

function measureLabel(measure: Measure): string {
  if (measure === "total") return "Base stat total";
  if (measure === "height") return "Height";
  if (measure === "weight") return "Weight";
  return STAT_LABELS[measure].long;
}

function numeral(gen: number): string {
  return GENERATIONS[gen - 1]?.numeral ?? String(gen);
}

/** Plain-language label for a filter chip, e.g. "Speed above 100". */
export function describeFilter(filter: Filter): string {
  const not = filter.negate;
  switch (filter.kind) {
    case "measure": {
      const unit = filter.measure === "height" ? " m" : filter.measure === "weight" ? " kg" : "";
      const label = `${measureLabel(filter.measure)} ${OP_WORDS[filter.op]} ${filter.value}${unit}`;
      return not ? `Not ${label[0].toLowerCase()}${label.slice(1)}` : label;
    }
    case "type":
      return `${not ? "Not " : ""}${titleCase(filter.type)} type`;
    case "weak":
      return `${not ? "Not weak" : "Weak"} to ${titleCase(filter.type)}`;
    case "resist":
      return `${not ? "Doesn’t resist" : "Resists"} ${titleCase(filter.type)}`;
    case "immune":
      return `${not ? "Not immune" : "Immune"} to ${titleCase(filter.type)}`;
    case "gen": {
      const range =
        filter.from === filter.to
          ? `Generation ${numeral(filter.from)}`
          : `Generations ${numeral(filter.from)}–${numeral(filter.to)}`;
      return not ? `Not ${range.replace("G", "g")}` : range;
    }
    case "is":
      return not ? `Not ${FLAG_LABELS[filter.flag].toLowerCase()}` : FLAG_LABELS[filter.flag];
    case "ability":
      return `${not ? "Without" : "Has"} ${titleCase(filter.slug)}`;
    case "role": {
      const role = filter.term.replace(/-/g, " ");
      return not ? `Not ${role}` : `${role[0].toUpperCase()}${role.slice(1)}`;
    }
  }
}

/** Remove one token from a search string, leaving the rest as typed. */
export function removeToken(q: string, raw: string): string {
  const tokens = tokenize(q);
  const index = tokens.indexOf(raw);
  if (index >= 0) tokens.splice(index, 1);
  return tokens.join(" ");
}

export const SEARCH_EXAMPLES = [
  { query: "spe>100", description: "Base stats: hp, atk, def, spa, spd, spe and bst" },
  { query: "type:fire", description: "Type; add a second for dual types" },
  { query: "weak:ground", description: "Takes super-effective damage; also resists: and immune:" },
  { query: "gen:1-3", description: "Generations by number, numeral or region" },
  { query: "ability:levitate", description: "Has an ability, hidden abilities included" },
  {
    query: "is:legendary",
    description: `Also ${IS_FLAGS.filter((f) => f !== "legendary").join(", ")}`,
  },
  {
    query: "role:sweeper",
    description: "Role from base stats, like wall, tank or special-sweeper",
  },
  { query: "height>2", description: "Height in metres or weight in kilograms" },
  { query: "-type:flying", description: "Put - before any filter to exclude it" },
] as const;
