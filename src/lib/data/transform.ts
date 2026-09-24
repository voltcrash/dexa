import type {
  ApiAbility,
  ApiMove,
  ApiPokemon,
  ApiPokemonForm,
  ApiPokemonSpecies,
} from "$lib/pokeapi/types.js";
import { englishName } from "$lib/pokemon/format.js";
import { generationFromName } from "$lib/pokemon/generations.js";
import { STAT_KEYS, isTypeName, type BaseStats, type TypeName } from "$lib/pokemon/types.js";
import type { AbilityEntry, DamageClass, DexEntry, MoveEntry } from "./types.js";

function idFromUrl(url: string) {
  return Number(/\/(\d+)\/?$/.exec(url)?.[1]);
}

function english<T extends { language: { name: string } }>(entries: T[]): T | undefined {
  return entries.find((entry) => entry.language.name === "en");
}

/** A readable form label, e.g. "Alolan" for "Alolan Raichu" or "Mega X" for "Mega Charizard X". */
export function formLabel(formName: string, speciesName: string): string {
  const label = formName
    .replace(speciesName, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return label || formName;
}

export function toDexEntry(
  pokemon: ApiPokemon,
  species: ApiPokemonSpecies,
  form: ApiPokemonForm | undefined,
  evolvedFrom: ReadonlySet<number>,
): DexEntry {
  const speciesName = englishName(species.names, species.name);
  const stats = STAT_KEYS.map(
    (key) => pokemon.stats.find((s) => s.stat.name === key)?.base_stat ?? 0,
  ) as BaseStats;
  const types = [...pokemon.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name)
    .filter(isTypeName) as TypeName[];

  let name = speciesName;
  let formText: string | undefined;
  if (!pokemon.is_default) {
    const fullName = form ? english(form.names)?.name : undefined;
    const fallback = english(form?.form_names ?? [])?.name;
    name = fullName ?? (fallback ? `${speciesName} (${fallback})` : speciesName);
    formText = fullName
      ? formLabel(fullName, speciesName)
      : (fallback ?? pokemon.name.replace(`${species.name}-`, ""));
  }

  const entry: DexEntry = {
    id: pokemon.id,
    slug: pokemon.name,
    name,
    speciesId: species.id,
    speciesSlug: species.name,
    isDefault: pokemon.is_default,
    types,
    stats,
    abilities: [...pokemon.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({ slug: a.ability.name, hidden: a.is_hidden })),
    generation: generationFromName(species.generation.name),
    height: pokemon.height,
    weight: pokemon.weight,
    legendary: species.is_legendary,
    mythical: species.is_mythical,
    baby: species.is_baby,
    final: !evolvedFrom.has(species.id),
  };
  if (formText) entry.form = formText;
  if (species.evolves_from_species) entry.evolvesFrom = idFromUrl(species.evolves_from_species.url);
  return entry;
}

/** PokéAPI writes `$effect_chance%` placeholders into effect text. */
export function fillEffectChance(text: string, chance: number | null): string {
  return text
    .replace(/\$effect_chance/g, String(chance ?? ""))
    .replace(/\s+/g, " ")
    .trim();
}

export function toMoveEntry(move: ApiMove): MoveEntry | null {
  if (!isTypeName(move.type.name)) return null;
  const effect = english(move.effect_entries)?.short_effect;
  const flavor = move.flavor_text_entries
    .filter((f) => f.language.name === "en")
    .at(-1)?.flavor_text;
  return {
    id: move.id,
    slug: move.name,
    name: englishName(move.names, move.name),
    type: move.type.name,
    damageClass: (move.damage_class?.name ?? "status") as DamageClass,
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    priority: move.priority,
    effect: fillEffectChance(effect ?? flavor ?? "", move.effect_chance),
    generation: generationFromName(move.generation.name),
  };
}

export function toAbilityEntry(ability: ApiAbility): AbilityEntry | null {
  if (!ability.is_main_series) return null;
  const effect = english(ability.effect_entries)?.short_effect;
  const flavor = ability.flavor_text_entries
    .filter((f) => f.language.name === "en")
    .at(-1)?.flavor_text;
  return {
    id: ability.id,
    slug: ability.name,
    name: englishName(ability.names, ability.name),
    effect: (effect ?? flavor ?? "").replace(/\s+/g, " ").trim(),
    generation: generationFromName(ability.generation.name),
  };
}
