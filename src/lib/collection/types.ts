export const COLLECTION_FLAGS = ["caught", "shiny", "favorite"] as const;
export type CollectionFlag = (typeof COLLECTION_FLAGS)[number];

export interface CollectionState {
  pokemonId: number;
  caught: boolean;
  shiny: boolean;
  favorite: boolean;
}

export function isEmpty(state: Omit<CollectionState, "pokemonId">): boolean {
  return !state.caught && !state.shiny && !state.favorite;
}

/** Parse a partial update, ignoring unknown keys and non-boolean values. */
export function parseFlags(body: unknown): Partial<Record<CollectionFlag, boolean>> {
  if (typeof body !== "object" || body === null) return {};
  const flags: Partial<Record<CollectionFlag, boolean>> = {};
  for (const flag of COLLECTION_FLAGS) {
    const value = (body as Record<string, unknown>)[flag];
    if (typeof value === "boolean") flags[flag] = value;
  }
  return flags;
}
