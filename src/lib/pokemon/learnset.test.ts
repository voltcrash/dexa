import { describe, expect, it } from "vite-plus/test";
import type { MoveEntry } from "$lib/data/types.js";
import type { ApiPokemon } from "$lib/pokeapi/types.js";
import { buildLearnset, defaultVersionGroup, versionGroupName } from "./learnset.js";

const vg = (name: string, id: number) => ({
  name,
  url: `https://pokeapi.co/api/v2/version-group/${id}/`,
});
const method = (name: string) => ({ name, url: "" });

const pokemon = {
  moves: [
    {
      move: { name: "ember", url: "" },
      version_group_details: [
        {
          level_learned_at: 7,
          version_group: vg("red-blue", 1),
          move_learn_method: method("level-up"),
          order: null,
        },
        {
          level_learned_at: 4,
          version_group: vg("scarlet-violet", 25),
          move_learn_method: method("level-up"),
          order: null,
        },
        {
          level_learned_at: 0,
          version_group: vg("the-indigo-disk", 27),
          move_learn_method: method("level-up"),
          order: null,
        },
        {
          level_learned_at: 1,
          version_group: vg("red-green-japan", 28),
          move_learn_method: method("level-up"),
          order: null,
        },
        {
          level_learned_at: 0,
          version_group: vg("champions", 32),
          move_learn_method: method("train"),
          order: null,
        },
      ],
    },
    {
      move: { name: "flamethrower", url: "" },
      version_group_details: [
        {
          level_learned_at: 0,
          version_group: vg("scarlet-violet", 25),
          move_learn_method: method("machine"),
          order: null,
        },
      ],
    },
    {
      move: { name: "unknown-move", url: "" },
      version_group_details: [
        {
          level_learned_at: 1,
          version_group: vg("scarlet-violet", 25),
          move_learn_method: method("level-up"),
          order: null,
        },
      ],
    },
  ],
} as unknown as ApiPokemon;

const lookup = (slug: string) =>
  slug === "unknown-move" ? undefined : ({ slug, name: slug } as MoveEntry);

describe("learnset", () => {
  it("names version groups", () => {
    expect(versionGroupName("scarlet-violet")).toBe("Scarlet & Violet");
    expect(versionGroupName("black-2-white-2")).toBe("Black 2 & White 2");
    expect(versionGroupName("platinum")).toBe("Platinum");
  });

  it("defaults to the newest base game", () => {
    const { versionGroups, selected } = buildLearnset(pokemon, lookup);
    expect(versionGroups.map((g) => g.slug)).toEqual([
      "red-green-japan",
      "red-blue",
      "scarlet-violet",
      "the-indigo-disk",
      "champions",
    ]);
    expect(selected).toBe("scarlet-violet");
    expect(defaultVersionGroup([{ slug: "the-teal-mask", name: "" }])).toBe("the-teal-mask");
  });

  it("collects moves for a version group", () => {
    const { moves } = buildLearnset(pokemon, lookup, "scarlet-violet");
    expect(moves.map((m) => [m.slug, m.method, m.level])).toEqual([
      ["flamethrower", "machine", 0],
      ["ember", "level-up", 4],
    ]);
    expect(buildLearnset(pokemon, lookup, "red-blue").moves[0].level).toBe(7);
    expect(buildLearnset(pokemon, lookup, "champions").moves[0].method).toBe("other");
  });
});
