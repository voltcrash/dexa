import type { DexEntry } from "$lib/data/types.js";
import type { DexListEntry } from "$lib/dex/list.js";
import type { EvolutionNode } from "./evolution-tree.js";

export interface FlavorEntry {
  text: string;
  versions: string[];
}

export interface PokemonDetail {
  entry: DexEntry;
  genus: string;
  flavor: FlavorEntry[];
  abilities: { slug: string; name: string; effect: string; hidden: boolean }[];
  forms: DexListEntry[];
  training: {
    evYield: { stat: string; value: number }[];
    captureRate: number;
    baseHappiness: number | null;
    baseExperience: number | null;
    growthRate: string;
    heldItems: string[];
  };
  breeding: {
    eggGroups: string[];
    genderRate: number;
    hatchCycles: number | null;
  };
  evolution: EvolutionNode | null;
  cries: { latest: string | null; legacy: string | null };
  prev: DexListEntry | null;
  next: DexListEntry | null;
}
