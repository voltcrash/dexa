import { describe, expect, it } from "vite-plus/test";
import {
  bestOffense,
  defensiveProfile,
  effectiveness,
  formatMultiplier,
  groupProfile,
  typeMultiplier,
} from "./matchups.js";
import { TYPES } from "./types.js";

describe("type chart", () => {
  it("covers every attacking and defending type", () => {
    for (const a of TYPES) for (const d of TYPES) expect(typeMultiplier(a, d)).toBeTypeOf("number");
  });

  it("matches known matchups", () => {
    expect(typeMultiplier("fire", "grass")).toBe(2);
    expect(typeMultiplier("normal", "ghost")).toBe(0);
    expect(typeMultiplier("dragon", "fairy")).toBe(0);
    expect(typeMultiplier("steel", "fairy")).toBe(2);
    expect(typeMultiplier("water", "normal")).toBe(1);
  });

  it("multiplies dual types", () => {
    expect(effectiveness("rock", ["fire", "flying"])).toBe(4);
    expect(effectiveness("ground", ["fire", "flying"])).toBe(0);
    expect(effectiveness("grass", ["fire", "flying"])).toBe(0.25);
  });
});

describe("defensive profile", () => {
  it("lists Charizard's weaknesses", () => {
    const groups = groupProfile(defensiveProfile(["fire", "flying"]));
    expect(groups[0]).toEqual({ multiplier: 4, types: ["rock"] });
    expect(groups.find((g) => g.multiplier === 0)?.types).toEqual(["ground"]);
  });

  it("applies abilities", () => {
    expect(defensiveProfile(["ghost", "poison"], "levitate").ground).toBe(0);
    expect(defensiveProfile(["ice", "water"], "thick-fat").fire).toBe(0.5);
    const shedinja = defensiveProfile(["bug", "ghost"], "wonder-guard");
    expect(shedinja.normal).toBe(0);
    expect(shedinja.fire).toBe(2);
    expect(defensiveProfile(["grass"], "unknown-ability").fire).toBe(2);
  });
});

describe("offense", () => {
  it("takes the best attacking type", () => {
    expect(bestOffense(["water", "ice"], ["dragon", "flying"])).toBe(4);
    expect(bestOffense([], ["normal"])).toBe(0);
  });

  it("formats multipliers", () => {
    expect(formatMultiplier(0.25)).toBe("¼×");
    expect(formatMultiplier(4)).toBe("4×");
  });
});
