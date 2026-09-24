import { error, json } from "@sveltejs/kit";
import { parseFlags } from "$lib/collection/types.js";
import { updateCollection } from "$lib/server/collection.js";
import { pokemonById } from "$lib/server/dex.js";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ locals, params, request }) => {
  if (!locals.user) error(401, "Sign in to track your collection");
  const pokemonId = Number(params.id);
  if (!pokemonById.has(pokemonId)) error(404, "No Pokémon with that id");
  const flags = parseFlags(await request.json().catch(() => null));
  if (Object.keys(flags).length === 0)
    error(400, "Send caught, shiny or favorite as true or false");
  return json(await updateCollection(locals.user.id, pokemonId, flags));
};
