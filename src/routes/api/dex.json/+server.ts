import { pokemonList } from "#lib/server/dex.js";

export const prerender = true;

export function GET() {
  return Response.json(pokemonList);
}
