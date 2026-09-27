import { describe, expect, it } from "vite-plus/test";
import { SHAPE_MAX, ringPoints, shapeFraction, shapePoints, toPath } from "./shape.js";

describe("shapeFraction", () => {
  it("scales base stats toward the rim and clamps outliers", () => {
    expect(shapeFraction(SHAPE_MAX)).toBe(1);
    expect(shapeFraction(255)).toBe(1);
    expect(shapeFraction(0)).toBeCloseTo(0.04);
    expect(shapeFraction(45)).toBeCloseTo(0.52);
    expect(shapeFraction(90)).toBeCloseTo(0.72);
  });
});

describe("shapePoints", () => {
  it("puts HP at the top and physical stats on the right", () => {
    // Attack is maxed and Sp. Atk is minimal, so the right side reaches further.
    const [hp, attack, , , , spAtk] = shapePoints([180, 180, 90, 1, 90, 90], 50);
    expect(hp).toEqual({ x: 50, y: 0 });
    expect(attack.x).toBeGreaterThan(50);
    expect(spAtk.x).toBeLessThan(50);
    expect(attack.x - 50).toBeGreaterThan(50 - spAtk.x);
  });

  it("puts Speed at the bottom", () => {
    const speed = shapePoints([90, 90, 90, 90, 90, 180], 50)[3];
    expect(speed.x).toBeCloseTo(50);
    expect(speed.y).toBeCloseTo(100);
  });
});

describe("toPath", () => {
  it("writes SVG polygon points with two decimals", () => {
    expect(toPath(ringPoints(1, 10).slice(0, 2))).toBe("10,0 18.66,5");
  });
});
