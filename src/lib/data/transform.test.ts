import { describe, expect, it } from "vite-plus/test";
import type { ApiPokemon, ApiPokemonForm, ApiPokemonSpecies } from "$lib/pokeapi/types.js";
import { fillEffectChance, formLabel, toDexEntry } from "./transform.js";

const ref = (name: string, id = 1) => ({ name, url: `https://pokeapi.co/api/v2/x/${id}/` });
const en = (name: string) => ({ name, language: ref("en") });

const species = {
  id: 26,
  name: "raichu",
  names: [en("Raichu")],
  generation: ref("generation-i"),
  is_legendary: false,
  is_mythical: false,
  is_baby: false,
  evolves_from_species: ref("pikachu", 25),
} as ApiPokemonSpecies;

function pokemon(overrides: Partial<ApiPokemon>): ApiPokemon {
  return {
    id: 26,
    name: "raichu",
    is_default: true,
    height: 8,
    weight: 300,
    types: [{ slot: 1, type: ref("electric") }],
    stats: ["hp", "attack", "defense", "special-attack", "special-defense", "speed"].map(
      (name, i) => ({ base_stat: 50 + i, effort: 0, stat: ref(name) }),
    ),
    abilities: [
      { slot: 3, is_hidden: true, ability: ref("lightning-rod") },
      { slot: 1, is_hidden: false, ability: ref("static") },
    ],
    ...overrides,
  } as ApiPokemon;
}

describe("toDexEntry", () => {
  it("builds a default entry", () => {
    const entry = toDexEntry(pokemon({}), species, undefined, new Set());
    expect(entry).toMatchObject({
      id: 26,
      name: "Raichu",
      speciesId: 26,
      types: ["electric"],
      stats: [50, 51, 52, 53, 54, 55],
      generation: 1,
      evolvesFrom: 25,
      final: true,
    });
    expect(entry.abilities.map((a) => a.slug)).toEqual(["static", "lightning-rod"]);
    expect(entry.form).toBeUndefined();
  });

  it("names regional forms", () => {
    const form = {
      names: [en("Alolan Raichu")],
      form_names: [en("Alolan Form")],
    } as ApiPokemonForm;
    const entry = toDexEntry(
      pokemon({
        id: 10100,
        name: "raichu-alola",
        is_default: false,
        types: [
          { slot: 2, type: ref("psychic") },
          { slot: 1, type: ref("electric") },
        ],
      }),
      species,
      form,
      new Set([26]),
    );
    expect(entry).toMatchObject({
      name: "Alolan Raichu",
      form: "Alolan",
      types: ["electric", "psychic"],
      final: false,
    });
  });
});

describe("helpers", () => {
  it("derives form labels", () => {
    expect(formLabel("Mega Charizard X", "Charizard")).toBe("Mega X");
    expect(formLabel("Charizard", "Charizard")).toBe("Charizard");
  });

  it("fills effect chance placeholders", () => {
    expect(fillEffectChance("Has a $effect_chance% chance to burn.", 10)).toBe(
      "Has a 10% chance to burn.",
    );
  });
});
