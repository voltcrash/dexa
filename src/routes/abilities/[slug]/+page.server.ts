import { error } from "@sveltejs/kit";
import type { Config } from "@sveltejs/adapter-vercel";
import { toListEntry } from "$lib/dex/list.js";
import { pokeapi } from "$lib/pokeapi/client.js";
import type { ApiAbility } from "$lib/pokeapi/types.js";
import { cleanFlavorText } from "$lib/pokemon/format.js";
import { abilitiesBySlug, pokemonWithAbility } from "$lib/server/dex.js";
import type { PageServerLoad } from "./$types";

export const config: Config = { isr: { expiration: 60 * 60 * 24 * 7 } };

export const load: PageServerLoad = async ({ params, fetch }) => {
  const ability = abilitiesBySlug.get(params.slug);
  if (!ability) error(404, "No ability by that name");
  const api = await pokeapi<ApiAbility>(`ability/${ability.id}`, fetch);
  const holders = pokemonWithAbility(ability.slug);
  const hidden = (entry: (typeof holders)[number]) =>
    entry.abilities.some((a) => a.slug === ability.slug && a.hidden);

  return {
    ability,
    effect:
      api.effect_entries.find((e) => e.language.name === "en")?.effect.replace(/\s+/g, " ") ??
      ability.effect,
    flavor: cleanFlavorText(
      api.flavor_text_entries.filter((f) => f.language.name === "en").at(-1)?.flavor_text ?? "",
    ),
    regular: holders.filter((p) => !hidden(p)).map(toListEntry),
    hidden: holders.filter(hidden).map(toListEntry),
  };
};
