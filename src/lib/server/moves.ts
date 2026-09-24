import { error } from "@sveltejs/kit";
import { fillEffectChance } from "$lib/data/transform.js";
import { toListEntry } from "$lib/dex/list.js";
import { pokeapi } from "$lib/pokeapi/client.js";
import type { ApiMove } from "$lib/pokeapi/types.js";
import { cleanFlavorText, titleCase } from "$lib/pokemon/format.js";
import { movesBySlug, pokemonBySlug } from "./dex.js";

export async function getMoveDetail(slug: string, fetchFn: typeof fetch) {
  const move = movesBySlug.get(slug);
  if (!move) error(404, "No move by that name");
  const api = await pokeapi<ApiMove>(`move/${move.id}`, fetchFn);

  const effect = api.effect_entries.find((e) => e.language.name === "en")?.effect;
  const flavor = api.flavor_text_entries
    .filter((f) => f.language.name === "en")
    .at(-1)?.flavor_text;
  const learnedBy = api.learned_by_pokemon
    .map((p) => pokemonBySlug.get(p.name))
    .filter((p) => p !== undefined)
    .sort((a, b) => a.speciesId - b.speciesId || a.id - b.id)
    .map(toListEntry);

  return {
    move,
    effect: effect ? fillEffectChance(effect, api.effect_chance) : move.effect,
    flavor: flavor ? cleanFlavorText(flavor) : null,
    target: titleCase(api.target.name),
    learnedBy,
  };
}
