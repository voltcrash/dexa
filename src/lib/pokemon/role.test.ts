import { describe, expect, it } from "vite-plus/test";
import { roleMatches, statRole } from "./role.js";
import type { BaseStats } from "./types.js";

const label = (stats: BaseStats) => statRole(stats).label;

describe("statRole", () => {
  it("spots sweepers and glass cannons", () => {
    expect(label([108, 130, 95, 80, 85, 102])).toBe("Physical sweeper"); // Garchomp
    expect(label([78, 84, 78, 109, 85, 100])).toBe("Special sweeper"); // Charizard
    expect(label([70, 110, 70, 115, 70, 90])).toBe("Mixed sweeper"); // Lucario
    expect(label([55, 50, 45, 135, 95, 120])).toBe("Special glass cannon"); // Alakazam
  });

  it("spots walls by their stronger defense", () => {
    expect(label([255, 10, 10, 75, 135, 55])).toBe("Special wall"); // Blissey
    expect(label([65, 80, 140, 40, 70, 70])).toBe("Physical wall"); // Skarmory
    expect(label([50, 63, 152, 53, 142, 35])).toBe("Wall"); // Toxapex
  });

  it("spots tanks, speedsters and all-rounders", () => {
    expect(label([100, 134, 110, 95, 100, 61])).toBe("Physical tank"); // Tyranitar
    expect(label([85, 90, 80, 70, 80, 130])).toBe("Speedster"); // Crobat
    expect(label([100, 100, 100, 100, 100, 100])).toBe("All-rounder"); // Mew
  });
});

describe("roleMatches", () => {
  const sweeper = statRole([108, 130, 95, 80, 85, 102]);
  it("matches the whole label, its side or its kind", () => {
    expect(roleMatches(sweeper, "physical-sweeper")).toBe(true);
    expect(roleMatches(sweeper, "sweeper")).toBe(true);
    expect(roleMatches(sweeper, "physical")).toBe(true);
    expect(roleMatches(sweeper, "wall")).toBe(false);
    expect(roleMatches(sweeper, "")).toBe(false);
  });
});
