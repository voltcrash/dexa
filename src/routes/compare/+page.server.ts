import { abilitiesBySlug, pokemonBySlug } from "$lib/server/dex.js";
import { titleCase } from "$lib/pokemon/format.js";
import type { PageServerLoad } from "./$types";

const MAX_COMPARE = 4;

export const load: PageServerLoad = ({ url }) => {
  const slugs = [
    ...new Set((url.searchParams.get("p") ?? "").split(",").map((s) => s.trim().toLowerCase())),
  ];
  const entries = slugs
    .map((slug) => pokemonBySlug.get(slug))
    .filter((entry) => entry !== undefined)
    .slice(0, MAX_COMPARE)
    .map((entry) => ({
      ...entry,
      abilityNames: entry.abilities.map((a) => ({
        name: abilitiesBySlug.get(a.slug)?.name ?? titleCase(a.slug),
        hidden: a.hidden,
      })),
    }));
  return { entries };
};
