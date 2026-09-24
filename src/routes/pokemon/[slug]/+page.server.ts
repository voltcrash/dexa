import { redirect } from "@sveltejs/kit";
import { pokemonById } from "$lib/server/dex.js";
import { findEntry, getPokemonDetail } from "$lib/server/pokemon.js";
import type { Config } from "@sveltejs/adapter-vercel";
import type { PageServerLoad } from "./$types";

export const config: Config = {
  isr: { expiration: 60 * 60 * 24 * 7 },
};

export const load: PageServerLoad = async ({ params, fetch }) => {
  if (/^\d+$/.test(params.slug)) {
    const byId = pokemonById.get(Number(params.slug));
    if (byId) redirect(308, `/pokemon/${byId.slug}`);
  }
  const entry = findEntry(params.slug);
  return { detail: await getPokemonDetail(entry, fetch) };
};
