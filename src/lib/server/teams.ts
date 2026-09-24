import { and, count, desc, eq } from "drizzle-orm";
import { MAX_SAVED_TEAMS, type SavedTeam } from "$lib/team/saved.js";
import type { TeamInput } from "$lib/team/validate.js";
import { getDb } from "./db/index.js";
import { team } from "./db/schema.js";

function toSaved(row: typeof team.$inferSelect): SavedTeam {
  return {
    id: row.id,
    name: row.name,
    members: row.members,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listTeams(userId: string): Promise<SavedTeam[]> {
  const rows = await getDb()
    .select()
    .from(team)
    .where(eq(team.userId, userId))
    .orderBy(desc(team.updatedAt));
  return rows.map(toSaved);
}

export async function createTeam(userId: string, input: TeamInput): Promise<SavedTeam | "limit"> {
  const db = getDb();
  const [{ total }] = await db.select({ total: count() }).from(team).where(eq(team.userId, userId));
  if (total >= MAX_SAVED_TEAMS) return "limit";
  const [row] = await db
    .insert(team)
    .values({ userId, ...input })
    .returning();
  return toSaved(row);
}

export async function updateTeam(
  userId: string,
  id: string,
  input: Partial<TeamInput>,
): Promise<SavedTeam | null> {
  const [row] = await getDb()
    .update(team)
    .set(input)
    .where(and(eq(team.id, id), eq(team.userId, userId)))
    .returning();
  return row ? toSaved(row) : null;
}

export async function deleteTeam(userId: string, id: string): Promise<boolean> {
  const rows = await getDb()
    .delete(team)
    .where(and(eq(team.id, id), eq(team.userId, userId)))
    .returning({ id: team.id });
  return rows.length > 0;
}
