import { abilities, pokemon } from "$lib/server/dex.js";
import type { PageServerLoad } from "./$types";

const holders = new Map<string, number>();
for (const entry of pokemon) {
  if (!entry.isDefault) continue;
  for (const { slug } of entry.abilities) holders.set(slug, (holders.get(slug) ?? 0) + 1);
}

export const load: PageServerLoad = ({ setHeaders }) => {
  setHeaders({
    "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  });
  return { abilities: abilities.map((a) => ({ ...a, holders: holders.get(a.slug) ?? 0 })) };
};
