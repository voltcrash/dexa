import { error } from "@sveltejs/kit";
import type { DexEntry } from "$lib/data/types.js";
import { toListEntry } from "$lib/dex/list.js";
import { pokeapi } from "$lib/pokeapi/client.js";
import type { ApiEvolutionChain, ApiPokemon, ApiPokemonSpecies } from "$lib/pokeapi/types.js";
import { buildEvolutionTree } from "$lib/pokemon/evolution-tree.js";
import { cleanFlavorText, titleCase, versionName } from "$lib/pokemon/format.js";
import type { FlavorEntry, PokemonDetail } from "$lib/pokemon/detail.js";
import { STAT_KEYS } from "$lib/pokemon/types.js";
import { abilitiesBySlug, formsOfSpecies, pokemon, pokemonBySlug } from "./dex.js";

const defaults = pokemon.filter((p) => p.isDefault);
const defaultsBySpecies = new Map(defaults.map((p) => [p.speciesId, p]));

function flavorEntries(species: ApiPokemonSpecies): FlavorEntry[] {
  const byText = new Map<string, string[]>();
  for (const entry of species.flavor_text_entries) {
    if (entry.language.name !== "en") continue;
    const text = cleanFlavorText(entry.flavor_text);
    byText.set(text, [...(byText.get(text) ?? []), versionName(entry.version.name)]);
  }
  // Newest games last in PokéAPI; show them first.
  return [...byText.entries()].map(([text, versions]) => ({ text, versions })).reverse();
}

export function findEntry(slugOrId: string): DexEntry {
  const entry = pokemonBySlug.get(slugOrId.toLowerCase());
  if (!entry) error(404, "No Pokémon by that name");
  return entry;
}

export async function getPokemonDetail(
  entry: DexEntry,
  fetchFn: typeof fetch,
): Promise<PokemonDetail> {
  const [api, species] = await Promise.all([
    pokeapi<ApiPokemon>(`pokemon/${entry.id}`, fetchFn),
    pokeapi<ApiPokemonSpecies>(`pokemon-species/${entry.speciesId}`, fetchFn),
  ]);

  const chain = species.evolution_chain
    ? await pokeapi<ApiEvolutionChain>(species.evolution_chain.url, fetchFn).catch(() => null)
    : null;

  const index = defaults.findIndex((p) => p.speciesId === entry.speciesId);
  const neighbour = (offset: number) => {
    const target = defaults[index + offset];
    return target ? toListEntry(target) : null;
  };

  return {
    entry,
    genus: species.genera.find((g) => g.language.name === "en")?.genus ?? "",
    flavor: flavorEntries(species),
    abilities: entry.abilities.map(({ slug, hidden }) => {
      const ability = abilitiesBySlug.get(slug);
      return {
        slug,
        hidden,
        name: ability?.name ?? titleCase(slug),
        effect: ability?.effect ?? "",
      };
    }),
    forms: formsOfSpecies(entry.speciesId).map(toListEntry),
    training: {
      evYield: api.stats
        .filter((s) => s.effort > 0)
        .map((s) => ({ stat: s.stat.name, value: s.effort }))
        .sort((a, b) => STAT_KEYS.indexOf(a.stat as never) - STAT_KEYS.indexOf(b.stat as never)),
      captureRate: species.capture_rate,
      baseHappiness: species.base_happiness,
      baseExperience: api.base_experience,
      growthRate: titleCase(species.growth_rate.name),
      heldItems: api.held_items.map((h) => titleCase(h.item.name)),
    },
    breeding: {
      eggGroups: species.egg_groups.map((g) => titleCase(g.name)),
      genderRate: species.gender_rate,
      hatchCycles: species.hatch_counter,
    },
    evolution: chain ? buildEvolutionTree(chain.chain, (id) => defaultsBySpecies.get(id)) : null,
    cries: api.cries,
    prev: neighbour(-1),
    next: neighbour(1),
  };
}
