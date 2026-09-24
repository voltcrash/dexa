import { pokemonBySlug } from "$lib/server/dex.js";
import { parseTeam, type TeamMember } from "$lib/team/analysis.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url }) => {
  const members = parseTeam(url.searchParams.get("p"))
    .map((slug) => pokemonBySlug.get(slug))
    .filter((entry) => entry !== undefined)
    .map(({ id, slug, name, speciesId, types, stats }): TeamMember => ({
      id,
      slug,
      name,
      speciesId,
      types,
      stats,
    }));
  return { members };
};
