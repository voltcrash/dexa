import { isFiltered, parseQuery, queryDex } from "#lib/dex/list.js";
import { encodeWallTypes, isWallColor } from "#lib/dex/wall.js";
import { pokemonList } from "#lib/server/dex.js";
import type { PageServerLoad } from "./$types";

const INITIAL_COUNT = 48;
const species = pokemonList.filter((p) => p.isDefault);
const wallTypes = encodeWallTypes(species);

export const load: PageServerLoad = ({ url, setHeaders }) => {
  const query = parseQuery(url.searchParams);
  const results = queryDex(pokemonList, query);
  const color = url.searchParams.get("color");
  setHeaders({ "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" });
  return {
    query,
    view: url.searchParams.get("view") === "grid" ? ("grid" as const) : ("list" as const),
    color: isWallColor(color) ? color : ("type" as const),
    initial: results.slice(0, INITIAL_COUNT),
    total: results.length,
    speciesCount: species.length,
    wallTypes,
    wallMatches: isFiltered(query) ? [...new Set(results.map((p) => p.speciesId))] : null,
  };
};
