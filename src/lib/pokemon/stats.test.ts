import { describe, expect, it } from "vite-plus/test";
import { statBand } from "./stats.js";

describe("statBand", () => {
  it("places base stats in rating bands", () => {
    expect(statBand(1)).toBe(1);
    expect(statBand(49)).toBe(1);
    expect(statBand(50)).toBe(2);
    expect(statBand(79)).toBe(2);
    expect(statBand(80)).toBe(3);
    expect(statBand(100)).toBe(4);
    expect(statBand(120)).toBe(5);
    expect(statBand(150)).toBe(6);
    expect(statBand(255)).toBe(6);
  });
});
