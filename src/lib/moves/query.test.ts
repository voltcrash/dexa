import { describe, expect, it } from "vite-plus/test";
import type { MoveEntry } from "$lib/data/types.js";
import { DEFAULT_MOVE_QUERY, parseMoveQuery, queryMoves, toMoveSearchParams } from "./query.js";

const move = (partial: Partial<MoveEntry> & Pick<MoveEntry, "name">): MoveEntry => ({
  id: 1,
  slug: partial.name.toLowerCase().replace(/ /g, "-"),
  type: "normal",
  damageClass: "physical",
  power: null,
  accuracy: null,
  pp: 10,
  priority: 0,
  effect: "",
  generation: 1,
  ...partial,
});

const moves = [
  move({ name: "Flamethrower", type: "fire", damageClass: "special", power: 90, accuracy: 100 }),
  move({ name: "Fire Blast", type: "fire", damageClass: "special", power: 110, accuracy: 85 }),
  move({ name: "Swords Dance", damageClass: "status" }),
  move({ name: "Aerial Ace", type: "flying", power: 60 }),
];

const names = (list: MoveEntry[]) => list.map((m) => m.name);

describe("queryMoves", () => {
  it("filters by type and class", () => {
    expect(names(queryMoves(moves, { ...DEFAULT_MOVE_QUERY, types: ["fire"] }))).toEqual([
      "Fire Blast",
      "Flamethrower",
    ]);
    expect(names(queryMoves(moves, { ...DEFAULT_MOVE_QUERY, classes: ["status"] }))).toEqual([
      "Swords Dance",
    ]);
  });

  it("sorts by power with nulls last", () => {
    expect(names(queryMoves(moves, { ...DEFAULT_MOVE_QUERY, sort: "power", desc: true }))).toEqual([
      "Fire Blast",
      "Flamethrower",
      "Aerial Ace",
      "Swords Dance",
    ]);
  });

  it("ranks search matches", () => {
    expect(names(queryMoves(moves, { ...DEFAULT_MOVE_QUERY, q: "fire" }))).toEqual(["Fire Blast"]);
  });

  it("round-trips URL state", () => {
    const query = {
      ...DEFAULT_MOVE_QUERY,
      q: "ace",
      types: ["flying" as const],
      sort: "pp" as const,
      desc: true,
    };
    expect(parseMoveQuery(new URLSearchParams(toMoveSearchParams(query)))).toEqual(query);
  });
});
