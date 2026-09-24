import { TYPES, type TypeName } from "./types.js";

type Chart = Record<TypeName, Partial<Record<TypeName, number>>>;

/** Attacking type → defending type multipliers that differ from 1 (Generation VI onward). */
const CHART: Chart = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function typeMultiplier(attack: TypeName, defend: TypeName): number {
  return CHART[attack][defend] ?? 1;
}

/** Damage multiplier of an attacking type against a (possibly dual-typed) defender. */
export function effectiveness(attack: TypeName, defenders: readonly TypeName[]): number {
  return defenders.reduce((total, defend) => total * typeMultiplier(attack, defend), 1);
}

type AbilityRule = (attack: TypeName, multiplier: number) => number;

const immuneTo =
  (...types: TypeName[]): AbilityRule =>
  (attack, m) =>
    types.includes(attack) ? 0 : m;
const scale =
  (factor: number, ...types: TypeName[]): AbilityRule =>
  (attack, m) =>
    types.includes(attack) ? m * factor : m;

/** Abilities that change how much damage a Pokémon takes from a type. */
export const ABILITY_RULES: Record<string, { rule: AbilityRule; note: string }> = {
  levitate: { rule: immuneTo("ground"), note: "Immune to Ground" },
  "earth-eater": { rule: immuneTo("ground"), note: "Immune to Ground" },
  "flash-fire": { rule: immuneTo("fire"), note: "Immune to Fire" },
  "well-baked-body": { rule: immuneTo("fire"), note: "Immune to Fire" },
  "water-absorb": { rule: immuneTo("water"), note: "Immune to Water" },
  "storm-drain": { rule: immuneTo("water"), note: "Immune to Water" },
  "volt-absorb": { rule: immuneTo("electric"), note: "Immune to Electric" },
  "lightning-rod": { rule: immuneTo("electric"), note: "Immune to Electric" },
  "motor-drive": { rule: immuneTo("electric"), note: "Immune to Electric" },
  "sap-sipper": { rule: immuneTo("grass"), note: "Immune to Grass" },
  "dry-skin": {
    rule: (attack, m) => (attack === "water" ? 0 : attack === "fire" ? m * 1.25 : m),
    note: "Immune to Water, takes more from Fire",
  },
  "thick-fat": { rule: scale(0.5, "fire", "ice"), note: "Halves Fire and Ice damage" },
  heatproof: { rule: scale(0.5, "fire"), note: "Halves Fire damage" },
  "water-bubble": { rule: scale(0.5, "fire"), note: "Halves Fire damage" },
  "purifying-salt": { rule: scale(0.5, "ghost"), note: "Halves Ghost damage" },
  fluffy: { rule: scale(2, "fire"), note: "Doubles Fire damage" },
  "wonder-guard": {
    rule: (_attack, m) => (m > 1 ? m : 0),
    note: "Only super-effective moves hit",
  },
  filter: { rule: (_a, m) => (m > 1 ? m * 0.75 : m), note: "Softens super-effective hits" },
  "solid-rock": { rule: (_a, m) => (m > 1 ? m * 0.75 : m), note: "Softens super-effective hits" },
  "prism-armor": { rule: (_a, m) => (m > 1 ? m * 0.75 : m), note: "Softens super-effective hits" },
};

export type DefensiveProfile = Record<TypeName, number>;

/** How much damage each attacking type deals to a defender, optionally with an ability applied. */
export function defensiveProfile(types: readonly TypeName[], ability?: string): DefensiveProfile {
  const rule = ability ? ABILITY_RULES[ability]?.rule : undefined;
  const profile = {} as DefensiveProfile;
  for (const attack of TYPES) {
    const base = effectiveness(attack, types);
    profile[attack] = rule ? rule(attack, base) : base;
  }
  return profile;
}

export interface MatchupGroup {
  multiplier: number;
  types: TypeName[];
}

/** Group a profile by multiplier, strongest first, omitting neutral matchups. */
export function groupProfile(profile: DefensiveProfile): MatchupGroup[] {
  const groups = new Map<number, TypeName[]>();
  for (const type of TYPES) {
    const m = profile[type];
    if (m === 1) continue;
    groups.set(m, [...(groups.get(m) ?? []), type]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([multiplier, types]) => ({ multiplier, types }));
}

/** Best multiplier any of the given attacking types achieves against a defender. */
export function bestOffense(attacks: readonly TypeName[], defenders: readonly TypeName[]): number {
  return attacks.reduce((best, attack) => Math.max(best, effectiveness(attack, defenders)), 0);
}

export function formatMultiplier(multiplier: number): string {
  if (multiplier === 0.5) return "½×";
  if (multiplier === 0.25) return "¼×";
  return `${multiplier}×`;
}
