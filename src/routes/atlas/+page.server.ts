import { isAxis } from "$lib/dex/atlas.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url }) => {
  const x = url.searchParams.get("x");
  const y = url.searchParams.get("y");
  return {
    x: isAxis(x) ? x : ("attack" as const),
    y: isAxis(y) ? y : ("special-attack" as const),
    q: url.searchParams.get("q") ?? "",
    forms: url.searchParams.get("forms") === "1",
  };
};
