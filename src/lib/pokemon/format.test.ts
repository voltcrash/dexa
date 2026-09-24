import { describe, expect, it } from "vite-plus/test";
import {
  cleanFlavorText,
  dexNumber,
  formatHeight,
  formatWeight,
  genderRatio,
  titleCase,
  versionName,
} from "./format.js";
import { generationFromName, generationOfSpecies } from "./generations.js";

describe("format", () => {
  it("title-cases slugs with special cases", () => {
    expect(titleCase("solar-beam")).toBe("Solar Beam");
    expect(titleCase("mr-mime")).toBe("Mr. Mime");
    expect(titleCase("nidoran-f")).toBe("Nidoran♀");
    expect(titleCase("selected-pokemon")).toBe("Selected Pokémon");
  });

  it("names game versions", () => {
    expect(versionName("lets-go-pikachu")).toBe("Let’s Go, Pikachu!");
    expect(versionName("alpha-sapphire")).toBe("Alpha Sapphire");
  });

  it("pads dex numbers", () => {
    expect(dexNumber(6)).toBe("#0006");
    expect(dexNumber(1025)).toBe("#1025");
  });

  it("cleans game flavor text", () => {
    expect(
      cleanFlavorText("Spits fire that\nis hot enough to\nmelt boulders.\fKnown to cause"),
    ).toBe("Spits fire that is hot enough to melt boulders. Known to cause");
    expect(cleanFlavorText("A strange POKéMON")).toBe("A strange Pokémon");
  });

  it("converts height and weight", () => {
    expect(formatHeight(17)).toEqual({ metric: "1.7 m", imperial: "5′07″" });
    expect(formatWeight(905)).toEqual({ metric: "90.5 kg", imperial: "199.5 lb" });
  });

  it("computes gender ratios", () => {
    expect(genderRatio(-1)).toBeNull();
    expect(genderRatio(1)).toEqual({ female: 12.5, male: 87.5 });
  });
});

describe("generations", () => {
  it("parses roman numerals", () => {
    expect(generationFromName("generation-iv")).toBe(4);
    expect(generationFromName("generation-ix")).toBe(9);
    expect(generationFromName("generation-viii")).toBe(8);
  });

  it("finds the generation for a species", () => {
    expect(generationOfSpecies(152)?.region).toBe("Johto");
    expect(generationOfSpecies(1025)?.numeral).toBe("IX");
  });
});
