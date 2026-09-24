import type { DexEntry } from "$lib/data/types.js";
import type { ApiChainLink } from "$lib/pokeapi/types.js";
import type { TypeName } from "./types.js";
import { describeEvolution } from "./evolution.js";

export interface EvolutionNode {
  speciesId: number;
  slug: string;
  name: string;
  types: TypeName[];
  /** How this Pokémon evolves from its parent; empty for the root. */
  conditions: string[];
  children: EvolutionNode[];
}

function idFromUrl(url: string) {
  return Number(/\/(\d+)\/?$/.exec(url)?.[1]);
}

/** Build a display tree from a PokéAPI chain, using the index for names and types. */
export function buildEvolutionTree(
  link: ApiChainLink,
  lookup: (speciesId: number) => DexEntry | undefined,
): EvolutionNode | null {
  const speciesId = idFromUrl(link.species.url);
  const entry = lookup(speciesId);
  if (!entry) return null;
  return {
    speciesId,
    slug: entry.slug,
    name: entry.name,
    types: entry.types,
    conditions: [...new Set(link.evolution_details.map(describeEvolution))],
    children: link.evolves_to
      .map((child) => buildEvolutionTree(child, lookup))
      .filter((node): node is EvolutionNode => node !== null),
  };
}

export function countNodes(node: EvolutionNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}
