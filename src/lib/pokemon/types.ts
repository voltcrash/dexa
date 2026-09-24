export const TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type TypeName = (typeof TYPES)[number];

export function isTypeName(value: string): value is TypeName {
  return (TYPES as readonly string[]).includes(value);
}

/** Types whose badge needs light text; the rest read better with ink. */
const LIGHT_TEXT_TYPES = new Set<TypeName>(["fighting", "poison", "ghost", "dragon", "dark"]);

export function typeTextClass(type: TypeName): string {
  return LIGHT_TEXT_TYPES.has(type) ? "text-white" : "text-[#1c2340]";
}

export function typeColorVar(type: string): string {
  return `var(--type-${type})`;
}

export const STAT_KEYS = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;
export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_LABELS: Record<StatKey, { short: string; long: string }> = {
  hp: { short: "HP", long: "HP" },
  attack: { short: "Atk", long: "Attack" },
  defense: { short: "Def", long: "Defense" },
  "special-attack": { short: "SpA", long: "Sp. Atk" },
  "special-defense": { short: "SpD", long: "Sp. Def" },
  speed: { short: "Spe", long: "Speed" },
};

/** Base stats in STAT_KEYS order. */
export type BaseStats = [number, number, number, number, number, number];
