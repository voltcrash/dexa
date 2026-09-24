import { boolean, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";
import { timestamps } from "./columns.js";

/** One row per Pokémon a user has marked; rows with every flag off are deleted. */
export const collectionEntry = pgTable(
  "collection_entry",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    pokemonId: integer("pokemon_id").notNull(),
    caught: boolean("caught").notNull().default(false),
    shiny: boolean("shiny").notNull().default(false),
    favorite: boolean("favorite").notNull().default(false),
    ...timestamps,
  },
  // The key leads with user_id, so it also serves per-user lookups.
  (table) => [primaryKey({ columns: [table.userId, table.pokemonId] })],
);
