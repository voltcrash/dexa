import { describe, expect, it } from "vite-plus/test";
import type { DexListEntry } from "./list.js";
import { DEFAULT_QUERY, isFiltered, parseQuery, queryDex, toSearchParams } from "./list.js";
import { matchScore, normalize, parseDexNumber } from "./search.js";

function entry(partial: Partial<DexListEntry> & Pick<DexListEntry, "id" | "name">): DexListEntry {
  return {
    slug: partial.name.toLowerCase(),
    speciesId: partial.id,
    isDefault: true,
    types: ["normal"],
    stats: [50, 50, 50, 50, 50, 50],
    generation: 1,
    legendary: false,
    mythical: false,
    baby: false,
    final: true,
    ...partial,
  };
}

const dex = [
  entry({ id: 6, name: "Charizard", types: ["fire", "flying"], stats: [78, 84, 78, 109, 85, 100] }),
  entry({
    id: 10034,
    speciesId: 6,
    name: "Mega Charizard X",
    isDefault: false,
    form: "Mega X",
    types: ["fire", "dragon"],
  }),
  entry({ id: 122, name: "Mr. Mime", types: ["psychic", "fairy"] }),
  entry({
    id: 150,
    name: "Mewtwo",
    types: ["psychic"],
    legendary: true,
    stats: [106, 110, 90, 154, 90, 130],
  }),
  entry({ id: 151, name: "Mew", types: ["psychic"], mythical: true }),
  entry({ id: 669, name: "Flabébé", types: ["fairy"], generation: 6, final: false }),
];

const names = (list: DexListEntry[]) => list.map((e) => e.name);

describe("search", () => {
  it("normalizes names", () => {
    expect(normalize("Flabébé")).toBe("flabebe");
    expect(normalize("Nidoran♀")).toBe("nidoranf");
    expect(normalize("Mr. Mime")).toBe("mrmime");
  });

  it("ranks prefix above substring above fuzzy", () => {
    expect(matchScore("mew", "Mew")).toBe(0);
    expect(matchScore("mew", "Mewtwo")).toBe(1);
    expect(matchScore("mime", "Mr. Mime")).toBe(2);
    expect(matchScore("zard", "Charizard")).toBe(3);
    expect(matchScore("chzd", "Charizard")).toBe(4);
    expect(matchScore("xyz", "Charizard")).toBeNull();
  });

  it("parses dex numbers", () => {
    expect(parseDexNumber("#025")).toBe(25);
    expect(parseDexNumber("no. 6")).toBe(6);
    expect(parseDexNumber("25a")).toBeNull();
  });
});

describe("queryDex", () => {
  it("hides alternate forms unless asked", () => {
    expect(names(queryDex(dex, DEFAULT_QUERY))).not.toContain("Mega Charizard X");
    expect(names(queryDex(dex, { ...DEFAULT_QUERY, forms: true }))).toContain("Mega Charizard X");
  });

  it("finds forms when searching, after the default", () => {
    expect(names(queryDex(dex, { ...DEFAULT_QUERY, q: "charizard" }))).toEqual([
      "Charizard",
      "Mega Charizard X",
    ]);
  });

  it("requires every selected type", () => {
    expect(names(queryDex(dex, { ...DEFAULT_QUERY, types: ["psychic", "fairy"] }))).toEqual([
      "Mr. Mime",
    ]);
  });

  it("filters by generation and tag", () => {
    expect(names(queryDex(dex, { ...DEFAULT_QUERY, gens: [6] }))).toEqual(["Flabébé"]);
    expect(names(queryDex(dex, { ...DEFAULT_QUERY, tags: ["legendary"] }))).toEqual(["Mewtwo"]);
  });

  it("sorts by stats", () => {
    const result = queryDex(dex, { ...DEFAULT_QUERY, sort: "special-attack", desc: true });
    expect(result[0].name).toBe("Mewtwo");
  });

  it("searches by dex number", () => {
    expect(names(queryDex(dex, { ...DEFAULT_QUERY, q: "#150" }))).toEqual(["Mewtwo"]);
  });
});

describe("URL state", () => {
  it("round-trips through search params", () => {
    const query = {
      ...DEFAULT_QUERY,
      q: "mew",
      types: ["psychic" as const],
      gens: [1, 4],
      tags: ["legendary" as const],
      sort: "speed" as const,
      desc: true,
    };
    expect(parseQuery(toSearchParams(query))).toEqual(query);
  });

  it("drops invalid values and keeps defaults out of the URL", () => {
    const query = parseQuery(new URLSearchParams("type=fire,cake,water,grass&gen=0,3&sort=bogus"));
    expect(query.types).toEqual(["fire", "water"]);
    expect(query.gens).toEqual([3]);
    expect(query.sort).toBe("dex");
    expect(toSearchParams(DEFAULT_QUERY).toString()).toBe("");
    expect(isFiltered({ ...DEFAULT_QUERY, sort: "name" })).toBe(false);
  });
});
