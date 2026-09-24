import abilitiesJson from "$lib/data/abilities.json";
import movesJson from "$lib/data/moves.json";
import pokemonJson from "$lib/data/pokemon.json";
import type { AbilityEntry, DexEntry, MoveEntry } from "$lib/data/types.js";

export const pokemon = pokemonJson as DexEntry[];
export const moves = movesJson as MoveEntry[];
export const abilities = abilitiesJson as AbilityEntry[];

export const pokemonBySlug = new Map(pokemon.map((p) => [p.slug, p]));
export const pokemonById = new Map(pokemon.map((p) => [p.id, p]));
export const movesBySlug = new Map(moves.map((m) => [m.slug, m]));
export const abilitiesBySlug = new Map(abilities.map((a) => [a.slug, a]));

/** All Pokémon (default and alternate forms) belonging to a species. */
export function formsOfSpecies(speciesId: number): DexEntry[] {
  return pokemon.filter((p) => p.speciesId === speciesId);
}

export function pokemonWithAbility(slug: string): DexEntry[] {
  return pokemon.filter((p) => p.abilities.some((a) => a.slug === slug));
}
