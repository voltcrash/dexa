import type { DamageClass, MoveEntry } from "$lib/data/types.js";
import { matchScore } from "$lib/dex/search.js";
import { isTypeName, type TypeName } from "$lib/pokemon/types.js";

export const MOVE_SORTS = ["name", "power", "accuracy", "pp", "priority"] as const;
export type MoveSort = (typeof MOVE_SORTS)[number];
export const DAMAGE_CLASSES: DamageClass[] = ["physical", "special", "status"];

export interface MoveQuery {
  q: string;
  types: TypeName[];
  classes: DamageClass[];
  sort: MoveSort;
  desc: boolean;
}

export const DEFAULT_MOVE_QUERY: MoveQuery = {
  q: "",
  types: [],
  classes: [],
  sort: "name",
  desc: false,
};

export function parseMoveQuery(params: URLSearchParams): MoveQuery {
  const sort = params.get("sort") ?? "name";
  return {
    q: params.get("q") ?? "",
    types: (params.get("type") ?? "").split(",").filter(isTypeName).slice(0, 1),
    classes: (params.get("class") ?? "")
      .split(",")
      .filter((c): c is DamageClass => (DAMAGE_CLASSES as string[]).includes(c)),
    sort: (MOVE_SORTS as readonly string[]).includes(sort) ? (sort as MoveSort) : "name",
    desc: params.get("dir") === "desc",
  };
}

export function toMoveSearchParams(query: MoveQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.types.length) params.set("type", query.types.join(","));
  if (query.classes.length) params.set("class", query.classes.join(","));
  if (query.sort !== "name") params.set("sort", query.sort);
  if (query.desc) params.set("dir", "desc");
  return params.toString().replaceAll("%2C", ",");
}

export function queryMoves(moves: readonly MoveEntry[], query: MoveQuery): MoveEntry[] {
  const scored: { move: MoveEntry; score: number }[] = [];
  for (const move of moves) {
    if (query.types.length && !query.types.includes(move.type)) continue;
    if (query.classes.length && !query.classes.includes(move.damageClass)) continue;
    const score = query.q ? matchScore(query.q, move.name) : 0;
    if (score === null) continue;
    scored.push({ move, score });
  }
  const direction = query.desc ? -1 : 1;
  return scored
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      if (query.sort === "name") return direction * a.move.name.localeCompare(b.move.name);
      // Moves without a value (status moves, never-miss moves) always sort last.
      const va = a.move[query.sort];
      const vb = b.move[query.sort];
      if (va === null && vb === null) return a.move.name.localeCompare(b.move.name);
      if (va === null) return 1;
      if (vb === null) return -1;
      return direction * (va - vb) || a.move.name.localeCompare(b.move.name);
    })
    .map(({ move }) => move);
}
