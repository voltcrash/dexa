import { index, pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";
import { timestamps } from "./columns.js";

export const team = pgTable(
  "team",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Pokémon slugs in slot order. */
    members: text("members").array().notNull(),
    ...timestamps,
  },
  (table) => [index("team_user_idx").on(table.userId)],
);
