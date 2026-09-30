import { describe, expect, it } from "vite-plus/test";
import { describeFilter, matchesFilters, parseSearch, removeToken, wantsForms } from "./filters.js";
import { DEFAULT_QUERY, queryDex, type DexListEntry } from "./list.js";

function entry(partial: Partial<DexListEntry> & Pick<DexListEntry, "id" | "name">): DexListEntry {
  return {
    slug: partial.name.toLowerCase(),
    speciesId: partial.id,
    isDefault: true,
    types: ["normal"],
    stats: [50, 50, 50, 50, 50, 50],
    generation: 1,
    height: 10,
    weight: 100,
    abilities: [],
    legendary: false,
    mythical: false,
    baby: false,
    final: true,
    ...partial,
  };
}

const garchomp = entry({
  id: 445,
  name: "Garchomp",
  types: ["dragon", "ground"],
  stats: [108, 130, 95, 80, 85, 102],
  generation: 4,
  height: 19,
  weight: 950,
  abilities: ["sand-veil", "rough-skin"],
});
const gengar = entry({
  id: 94,
  name: "Gengar",
  types: ["ghost", "poison"],
  stats: [60, 65, 60, 130, 75, 110],
  abilities: ["cursed-body"],
});
const megaGengar = entry({
  id: 10038,
  speciesId: 94,
  name: "Mega Gengar",
  form: "Mega",
  isDefault: false,
  types: ["ghost", "poison"],
  stats: [60, 65, 80, 170, 95, 130],
  abilities: ["shadow-tag"],
});
const alolanRaichu = entry({
  id: 10100,
  speciesId: 26,
  name: "Alolan Raichu",
  form: "Alolan",
  isDefault: false,
  types: ["electric", "psychic"],
});
const dex = [gengar, megaGengar, alolanRaichu, garchomp];

const pick = (q: string) => dex.filter((e) => matchesFilters(e, parseSearch(q).filters));

describe("parseSearch", () => {
  it("separates filters from name text", () => {
    const search = parseSearch("spe>100 gar type:ghost");
    expect(search.text).toBe("gar");
    expect(search.filters.map((f) => f.kind)).toEqual(["measure", "type"]);
    expect(search.invalid).toEqual([]);
  });

  it("reports filters it cannot read", () => {
    expect(parseSearch("type:cake spe:fast is:shiny").invalid).toEqual([
      "type:cake",
      "spe:fast",
      "is:shiny",
    ]);
  });

  it("keeps Type: Null searchable", () => {
    expect(parseSearch("type: null").text).toBe("type: null");
  });

  it("reads quoted ability names", () => {
    const [filter] = parseSearch('ability:"rough skin"').filters;
    expect(filter).toMatchObject({ kind: "ability", slug: "rough-skin" });
  });
});

describe("matchesFilters", () => {
  it("compares base stats and totals", () => {
    expect(pick("spe>100")).toEqual([gengar, megaGengar, garchomp]);
    expect(pick("spe>=110 spa<150")).toEqual([gengar]);
    expect(pick("bst>=600")).toEqual([megaGengar, garchomp]);
  });

  it("compares height in metres and weight in kilograms", () => {
    expect(pick("height>1.5 weight>=95")).toEqual([garchomp]);
  });

  it("filters by type matchups", () => {
    expect(pick("weak:ice")).toEqual([garchomp]);
    expect(pick("immune:normal")).toEqual([gengar, megaGengar]);
    expect(pick("resist:fighting")).toEqual([alolanRaichu]);
  });

  it("filters by generation, flags and abilities", () => {
    expect(pick("gen:sinnoh")).toEqual([garchomp]);
    expect(pick("gen:1-3 is:regional")).toEqual([alolanRaichu]);
    expect(pick("is:mega")).toEqual([megaGengar]);
    expect(pick("ability:roughskin")).toEqual([garchomp]);
  });

  it("filters by role from base stats", () => {
    expect(pick("role:physical-sweeper")).toEqual([garchomp]);
    expect(pick("role:special")).toEqual([gengar, megaGengar]);
    expect(parseSearch("role:healer").invalid).toEqual(["role:healer"]);
  });

  it("negates filters with a leading minus", () => {
    expect(pick("-type:ghost")).toEqual([alolanRaichu, garchomp]);
    expect(pick("!is:form")).toEqual([gengar, garchomp]);
  });
});

describe("queryDex with filters", () => {
  it("hides forms for plain filters and shows them for form filters", () => {
    const names = (q: string) => queryDex(dex, { ...DEFAULT_QUERY, q }).map((e) => e.name);
    expect(names("type:ghost")).toEqual(["Gengar"]);
    expect(names("is:mega")).toEqual(["Mega Gengar"]);
    expect(names("gen type:ghost")).toEqual(["Gengar", "Mega Gengar"]);
    expect(wantsForms(parseSearch("-is:mega").filters)).toBe(false);
  });
});

describe("describeFilter", () => {
  it("writes filters in plain language", () => {
    const describe = (q: string) => parseSearch(q).filters.map(describeFilter);
    expect(describe("spe>100 -type:flying weak:ice")).toEqual([
      "Speed above 100",
      "Not Flying type",
      "Weak to Ice",
    ]);
    expect(describe("gen:1-3 is:final weight<=10")).toEqual([
      "Generations I–III",
      "Fully evolved",
      "Weight at most 10 kg",
    ]);
  });
});

describe("removeToken", () => {
  it("drops one filter and keeps the rest", () => {
    expect(removeToken("char spe>100 type:fire", "spe>100")).toBe("char type:fire");
  });
});
