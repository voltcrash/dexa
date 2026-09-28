import { describe, expect, it } from "vite-plus/test";
import { axisValue, isAxis, makeScale } from "./atlas.js";

describe("axisValue", () => {
  const entry = {
    stats: [78, 84, 78, 109, 85, 100] as [number, number, number, number, number, number],
    height: 17,
    weight: 905,
  };
  it("reads stats, totals and metric sizes", () => {
    expect(axisValue(entry, "special-attack")).toBe(109);
    expect(axisValue(entry, "total")).toBe(534);
    expect(axisValue(entry, "height")).toBe(1.7);
    expect(axisValue(entry, "weight")).toBe(90.5);
  });
});

describe("makeScale", () => {
  it("uses round linear ticks from zero", () => {
    const scale = makeScale([10, 180, 255], "attack");
    expect(scale.domain).toEqual([0, 300]);
    expect(scale.ticks).toEqual([0, 50, 100, 150, 200, 250, 300]);
    expect(scale.at(150)).toBe(0.5);
  });

  it("uses powers of ten on a log scale", () => {
    const scale = makeScale([0.1, 1.7, 14.5], "height");
    expect(scale.ticks).toEqual([0.1, 1, 10, 20]);
    expect(scale.at(20)).toBe(1);
    expect(makeScale([0.1, 999.9], "weight").ticks).toEqual([0.1, 1, 10, 100, 1000]);
  });
});

describe("isAxis", () => {
  it("accepts known axes only", () => {
    expect(isAxis("weight")).toBe(true);
    expect(isAxis("cuteness")).toBe(false);
  });
});
