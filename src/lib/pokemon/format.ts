import type { LocalizedName } from "$lib/pokeapi/types.js";

const SPECIAL_NAMES: Record<string, string> = {
  "nidoran-f": "Nidoran♀",
  "nidoran-m": "Nidoran♂",
  "mr-mime": "Mr. Mime",
  "mime-jr": "Mime Jr.",
  "mr-rime": "Mr. Rime",
  farfetchd: "Farfetch’d",
  sirfetchd: "Sirfetch’d",
  "type-null": "Type: Null",
  "ho-oh": "Ho-Oh",
  "porygon-z": "Porygon-Z",
  "jangmo-o": "Jangmo-o",
  "hakamo-o": "Hakamo-o",
  "kommo-o": "Kommo-o",
  flabebe: "Flabébé",
};

/** Title-case a PokéAPI slug, e.g. `solar-beam` → `Solar Beam`. */
export function titleCase(slug: string): string {
  if (SPECIAL_NAMES[slug]) return SPECIAL_NAMES[slug];
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

const VERSION_NAMES: Record<string, string> = {
  firered: "FireRed",
  leafgreen: "LeafGreen",
  heartgold: "HeartGold",
  soulsilver: "SoulSilver",
  "lets-go-pikachu": "Let’s Go, Pikachu!",
  "lets-go-eevee": "Let’s Go, Eevee!",
  "legends-arceus": "Legends: Arceus",
  "legends-za": "Legends: Z-A",
};

/** Display name of a game version such as `lets-go-pikachu`. */
export function versionName(slug: string): string {
  return VERSION_NAMES[slug] ?? titleCase(slug);
}

export function englishName(names: LocalizedName[], fallbackSlug: string): string {
  return names.find((n) => n.language.name === "en")?.name ?? titleCase(fallbackSlug);
}

export function dexNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

/** Flavor text from the games uses form feeds, soft hyphens and hard wraps. */
export function cleanFlavorText(text: string): string {
  return text
    .replace(/­\n/g, "")
    .replace(/­/g, "")
    .replace(/-\n/g, "-")
    .replace(/[\n\f\r]+/g, " ")
    .replace(/POKéMON/g, "Pokémon")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Height is in decimetres. */
export function formatHeight(decimetres: number): { metric: string; imperial: string } {
  const metres = decimetres / 10;
  const totalInches = Math.round(metres * 39.3701);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return {
    metric: `${metres.toFixed(1)} m`,
    imperial: `${feet}′${String(inches).padStart(2, "0")}″`,
  };
}

/** Weight is in hectograms. */
export function formatWeight(hectograms: number): { metric: string; imperial: string } {
  const kg = hectograms / 10;
  return { metric: `${kg.toFixed(1)} kg`, imperial: `${(kg * 2.20462).toFixed(1)} lb` };
}

/** PokéAPI gender_rate is the chance of being female in eighths, or -1 when genderless. */
export function genderRatio(genderRate: number): { female: number; male: number } | null {
  if (genderRate < 0) return null;
  const female = (genderRate / 8) * 100;
  return { female, male: 100 - female };
}

export function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}
