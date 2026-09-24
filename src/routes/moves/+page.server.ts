import { moves } from "$lib/server/dex.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ setHeaders }) => {
  setHeaders({
    "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  });
  return { moves };
};
