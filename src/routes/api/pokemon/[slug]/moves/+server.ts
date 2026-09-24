import { json } from "@sveltejs/kit";
import { findEntry, getLearnset } from "$lib/server/pokemon.js";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, url, fetch }) => {
  const learnset = await getLearnset(
    findEntry(params.slug),
    url.searchParams.get("vg") ?? undefined,
    fetch,
  );
  return json(learnset, {
    headers: {
      "cache-control": "public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
};
