import { describe, expect, it } from "vite-plus/test";
import { nameFit } from "./name-fit.js";

describe("nameFit", () => {
  it("widens short names and condenses long ones", () => {
    expect(nameFit("Mew").stretch).toBe(125);
    expect(nameFit("Charizard").stretch).toBe(100);
    expect(nameFit("Crabominable").stretch).toBeLessThan(85);
    expect(nameFit("Gigantamax Single Strike Urshifu").stretch).toBe(75);
  });

  it("counts characters, not UTF-16 units", () => {
    expect(nameFit("Flabébé").chars).toBe(7);
  });
});
