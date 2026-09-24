import { parseQuery, queryDex } from "$lib/dex/list.js";
import { pokemonList } from "$lib/server/dex.js";
import type { PageServerLoad } from "./$types";

const INITIAL_COUNT = 48;

export const load: PageServerLoad = ({ url, setHeaders }) => {
  const query = parseQuery(url.searchParams);
  const results = queryDex(pokemonList, query);
  setHeaders({ "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" });
  return {
    query,
    initial: results.slice(0, INITIAL_COUNT),
    total: results.length,
    speciesCount: pokemonList.filter((p) => p.isDefault).length,
  };
};
