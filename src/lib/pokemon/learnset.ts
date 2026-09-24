import type { MoveEntry } from "$lib/data/types.js";
import type { ApiPokemon } from "$lib/pokeapi/types.js";
import { titleCase } from "./format.js";

export const LEARN_METHODS = ["level-up", "machine", "egg", "tutor"] as const;
export type LearnMethod = (typeof LEARN_METHODS)[number] | "other";

export const LEARN_METHOD_LABELS: Record<LearnMethod, string> = {
  "level-up": "Level up",
  machine: "TM",
  egg: "Egg",
  tutor: "Tutor",
  other: "Other methods",
};

export interface VersionGroup {
  slug: string;
  name: string;
}

export interface LearnsetMove extends MoveEntry {
  method: LearnMethod;
  level: number;
}

export interface Learnset {
  versionGroups: VersionGroup[];
  selected: string;
  moves: LearnsetMove[];
}

const VERSION_GROUP_NAMES: Record<string, string> = {
  "firered-leafgreen": "FireRed & LeafGreen",
  "heartgold-soulsilver": "HeartGold & SoulSilver",
  "black-2-white-2": "Black 2 & White 2",
  "omega-ruby-alpha-sapphire": "Omega Ruby & Alpha Sapphire",
  "ultra-sun-ultra-moon": "Ultra Sun & Ultra Moon",
  "lets-go-pikachu-lets-go-eevee": "Let’s Go, Pikachu! & Let’s Go, Eevee!",
  "brilliant-diamond-shining-pearl": "Brilliant Diamond & Shining Pearl",
  "legends-arceus": "Legends: Arceus",
  "legends-za": "Legends: Z-A",
  "red-green-japan": "Red & Green (Japan)",
  "blue-japan": "Blue (Japan)",
  xd: "XD: Gale of Darkness",
  "x-y": "X & Y",
};

const PAIRED = new Set([
  "red-blue",
  "gold-silver",
  "ruby-sapphire",
  "diamond-pearl",
  "black-white",
  "sun-moon",
  "sword-shield",
  "scarlet-violet",
]);

/** Release order; PokéAPI ids are not chronological (Japanese Red and Green came later). */
const CHRONOLOGY = [
  "red-green-japan",
  "red-blue",
  "blue-japan",
  "yellow",
  "gold-silver",
  "crystal",
  "ruby-sapphire",
  "emerald",
  "colosseum",
  "firered-leafgreen",
  "xd",
  "diamond-pearl",
  "platinum",
  "heartgold-soulsilver",
  "black-white",
  "black-2-white-2",
  "x-y",
  "omega-ruby-alpha-sapphire",
  "sun-moon",
  "ultra-sun-ultra-moon",
  "lets-go-pikachu-lets-go-eevee",
  "sword-shield",
  "the-isle-of-armor",
  "the-crown-tundra",
  "brilliant-diamond-shining-pearl",
  "legends-arceus",
  "scarlet-violet",
  "the-teal-mask",
  "the-indigo-disk",
  "legends-za",
  "mega-dimension",
  "champions",
];

/** Expansions and spin-offs are poor defaults; prefer the latest main game. */
const NOT_DEFAULT = new Set([
  "the-isle-of-armor",
  "the-crown-tundra",
  "the-teal-mask",
  "the-indigo-disk",
  "mega-dimension",
  "champions",
  "colosseum",
  "xd",
]);

export function versionGroupName(slug: string): string {
  if (VERSION_GROUP_NAMES[slug]) return VERSION_GROUP_NAMES[slug];
  if (PAIRED.has(slug)) return slug.split("-").map(titleCase).join(" & ");
  return titleCase(slug);
}

function versionGroupId(url: string) {
  return Number(/\/(\d+)\/?$/.exec(url)?.[1]);
}

/** Version groups a Pokémon has moves in, oldest first. */
export function versionGroupsOf(pokemon: ApiPokemon): VersionGroup[] {
  const seen = new Map<string, number>();
  for (const move of pokemon.moves) {
    for (const detail of move.version_group_details) {
      seen.set(detail.version_group.name, versionGroupId(detail.version_group.url));
    }
  }
  const rank = (slug: string) => {
    const index = CHRONOLOGY.indexOf(slug);
    return index === -1 ? CHRONOLOGY.length + (seen.get(slug) ?? 0) : index;
  };
  return [...seen.keys()]
    .sort((a, b) => rank(a) - rank(b))
    .map((slug) => ({ slug, name: versionGroupName(slug) }));
}

export function defaultVersionGroup(groups: VersionGroup[]): string | undefined {
  const base = groups.filter((g) => !NOT_DEFAULT.has(g.slug));
  return (base.at(-1) ?? groups.at(-1))?.slug;
}

export function buildLearnset(
  pokemon: ApiPokemon,
  lookupMove: (slug: string) => MoveEntry | undefined,
  versionGroup?: string,
): Learnset {
  const versionGroups = versionGroupsOf(pokemon);
  const selected =
    versionGroup && versionGroups.some((g) => g.slug === versionGroup)
      ? versionGroup
      : (defaultVersionGroup(versionGroups) ?? "");

  const moves: LearnsetMove[] = [];
  for (const { move, version_group_details } of pokemon.moves) {
    const entry = lookupMove(move.name);
    if (!entry) continue;
    for (const detail of version_group_details) {
      if (detail.version_group.name !== selected) continue;
      const method = detail.move_learn_method.name;
      moves.push({
        ...entry,
        method: (LEARN_METHODS as readonly string[]).includes(method)
          ? (method as LearnMethod)
          : "other",
        level: detail.level_learned_at,
      });
    }
  }
  moves.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  return { versionGroups, selected, moves };
}
