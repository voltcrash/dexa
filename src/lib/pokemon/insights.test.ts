import { describe, expect, it } from "vite-plus/test";
import {
  closestStats,
  findCounters,
  percentBelow,
  statDistribution,
  statPercentiles,
  weightComparison,
} from "./insights.js";
import type { BaseStats, TypeName } from "./types.js";

const mon = (speciesId: number, types: TypeName[], stats: BaseStats) => ({
  speciesId,
  types,
  stats,
});

describe("percentiles", () => {
  it("counts the share strictly below a value", () => {
    expect(percentBelow(5, [1, 2, 5, 5, 9])).toBe(40);
    expect(percentBelow(0, [1, 2])).toBe(0);
    expect(percentBelow(10, [1, 2])).toBe(100);
    expect(percentBelow(1, [])).toBe(0);
  });

  it("ranks each stat and the total against a population", () => {
    const population = [
      mon(1, ["normal"], [50, 50, 50, 50, 50, 50]),
      mon(2, ["normal"], [100, 100, 100, 100, 100, 100]),
    ];
    const ranks = statPercentiles([100, 40, 100, 100, 100, 60], statDistribution(population));
    expect(ranks).toEqual([50, 0, 50, 50, 50, 50, 50]);
  });
});

describe("closestStats", () => {
  it("finds other species with the nearest stats", () => {
    const target = mon(1, ["normal"], [80, 80, 80, 80, 80, 80]);
    const population = [
      mon(1, ["normal"], [80, 80, 80, 80, 80, 80]),
      mon(2, ["normal"], [90, 70, 80, 80, 80, 80]),
      mon(3, ["normal"], [120, 120, 120, 120, 120, 120]),
      mon(4, ["normal"], [85, 85, 80, 80, 80, 80]),
    ];
    const twins = closestStats(target, population, 2);
    expect(twins.map((t) => t.entry.speciesId)).toEqual([4, 2]);
    expect(twins[0].gap).toBe(2);
  });
});

describe("findCounters", () => {
  it("keeps Pokémon that resist every same-type attack and hit back hard", () => {
    const charizard = { types: ["fire", "flying"] as TypeName[] };
    const pool = [
      mon(1, ["rock", "ground"], [90, 110, 130, 50, 60, 50]), // resists both, Rock 4×
      mon(2, ["water"], [90, 90, 90, 90, 90, 90]), // weak to nothing but only resists Fire
      mon(3, ["electric", "steel"], [80, 80, 80, 80, 80, 80]), // resists Flying, neutral to Fire
      mon(4, ["rock", "water"], [70, 100, 110, 80, 80, 40]), // resists both, Rock 4×, lower total
      mon(5, ["electric"], [60, 60, 60, 60, 60, 60]), // resists Flying only
    ];
    const counters = findCounters(charizard, pool);
    expect(counters.map((c) => c.entry.speciesId)).toEqual([1, 4]);
    expect(counters[0].attack).toEqual({ type: "rock", multiplier: 4 });
  });
});

describe("weightComparison", () => {
  it("compares weights with everyday things", () => {
    expect(weightComparison(1)).toBe("Lighter than an apple");
    expect(weightComparison(60)).toBe("About as heavy as a bowling ball");
    expect(weightComparison(905)).toBe("About as heavy as an adult person");
    expect(weightComparison(4600)).toBe("About as heavy as a grand piano");
    expect(weightComparison(120)).toBe("About as heavy as 2 bowling balls");
  });
});
