import { describe, expect, it } from "vite-plus/test";
import { decodeWallTypes, encodeWallTypes, heatBand, isWallColor, totalBand } from "./wall.js";

describe("wall type encoding", () => {
  it("round-trips single and dual types", () => {
    const code = encodeWallTypes([{ types: ["grass", "poison"] }, { types: ["fire"] }]);
    expect(code).toBe("ehb-");
    expect(decodeWallTypes(code)).toEqual([["grass", "poison"], ["fire"]]);
  });
});

describe("totalBand", () => {
  it("bands base stat totals from unevolved to legendary", () => {
    expect(totalBand(195)).toBe(1);
    expect(totalBand(318)).toBe(2);
    expect(totalBand(405)).toBe(3);
    expect(totalBand(525)).toBe(4);
    expect(totalBand(540)).toBe(5);
    expect(totalBand(680)).toBe(6);
  });
});

describe("heatBand", () => {
  it("rates a single stat with the stat bands", () => {
    const garchomp = {
      stats: [108, 130, 95, 80, 85, 102] as [number, number, number, number, number, number],
    };
    expect(heatBand(garchomp, "attack")).toBe(5);
    expect(heatBand(garchomp, "total")).toBe(6);
  });
});

describe("isWallColor", () => {
  it("accepts known modes only", () => {
    expect(isWallColor("speed")).toBe(true);
    expect(isWallColor("color")).toBe(false);
    expect(isWallColor(null)).toBe(false);
  });
});
