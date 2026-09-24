import { and, eq } from "drizzle-orm";
import { isEmpty, type CollectionFlag, type CollectionState } from "$lib/collection/types.js";
import { getDb } from "./db/index.js";
import { collectionEntry } from "./db/schema.js";

export async function getCollection(userId: string): Promise<CollectionState[]> {
  return getDb()
    .select({
      pokemonId: collectionEntry.pokemonId,
      caught: collectionEntry.caught,
      shiny: collectionEntry.shiny,
      favorite: collectionEntry.favorite,
    })
    .from(collectionEntry)
    .where(eq(collectionEntry.userId, userId));
}

export async function updateCollection(
  userId: string,
  pokemonId: number,
  flags: Partial<Record<CollectionFlag, boolean>>,
): Promise<CollectionState> {
  const db = getDb();
  const where = and(eq(collectionEntry.userId, userId), eq(collectionEntry.pokemonId, pokemonId));
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(collectionEntry).where(where);
    const next = {
      caught: flags.caught ?? existing?.caught ?? false,
      shiny: flags.shiny ?? existing?.shiny ?? false,
      favorite: flags.favorite ?? existing?.favorite ?? false,
    };
    if (isEmpty(next)) {
      await tx.delete(collectionEntry).where(where);
    } else {
      await tx
        .insert(collectionEntry)
        .values({ userId, pokemonId, ...next })
        .onConflictDoUpdate({
          target: [collectionEntry.userId, collectionEntry.pokemonId],
          set: next,
        });
    }
    return { pokemonId, ...next };
  });
}
