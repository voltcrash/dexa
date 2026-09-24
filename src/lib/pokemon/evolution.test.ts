import { describe, expect, it } from "vite-plus/test";
import type { ApiEvolutionDetail } from "$lib/pokeapi/types.js";
import { describeEvolution } from "./evolution.js";
import { statAt, statRanges } from "./stats.js";

const ref = (name: string) => ({ name, url: "" });

function detail(partial: Partial<ApiEvolutionDetail>): ApiEvolutionDetail {
  return {
    trigger: ref("level-up"),
    item: null,
    held_item: null,
    gender: null,
    known_move: null,
    known_move_type: null,
    location: null,
    min_level: null,
    min_happiness: null,
    min_beauty: null,
    min_affection: null,
    needs_overworld_rain: false,
    party_species: null,
    party_type: null,
    relative_physical_stats: null,
    time_of_day: "",
    trade_species: null,
    turn_upside_down: false,
    ...partial,
  };
}

describe("describeEvolution", () => {
  it("describes common methods", () => {
    expect(describeEvolution(detail({ min_level: 36 }))).toBe("Level 36");
    expect(describeEvolution(detail({ trigger: ref("use-item"), item: ref("water-stone") }))).toBe(
      "Use Water Stone",
    );
    expect(describeEvolution(detail({ trigger: ref("trade"), held_item: ref("metal-coat") }))).toBe(
      "Trade holding Metal Coat",
    );
    expect(describeEvolution(detail({ min_happiness: 160, time_of_day: "night" }))).toBe(
      "Level up with high friendship during the night",
    );
    expect(describeEvolution(detail({ min_level: 20, relative_physical_stats: 1 }))).toBe(
      "Level 20 with Attack above Defense",
    );
  });
});

describe("stats", () => {
  it("computes level 100 stats", () => {
    // Garchomp: base 108 HP, 130 Atk
    expect(statAt(108, { level: 100, iv: 31, ev: 252, isHp: true })).toBe(420);
    expect(statAt(130, { level: 100, iv: 31, ev: 252, nature: 1.1 })).toBe(394);
  });

  it("keeps Shedinja at 1 HP", () => {
    expect(statRanges([1, 90, 45, 30, 30, 40], 100)[0]).toEqual([1, 1]);
  });
});
