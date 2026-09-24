import { error, json } from "@sveltejs/kit";
import { pokemonBySlug } from "$lib/server/dex.js";
import { createTeam, listTeams } from "$lib/server/teams.js";
import { MAX_SAVED_TEAMS } from "$lib/team/saved.js";
import { validateTeamInput, type TeamInput } from "$lib/team/validate.js";
import type { RequestHandler } from "./$types";

const noStore = { "cache-control": "private, no-store" };

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, "Sign in to see your saved teams");
  return json(await listTeams(locals.user.id), { headers: noStore });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) error(401, "Sign in to save teams");
  const result = validateTeamInput(await request.json().catch(() => null), (slug) =>
    pokemonBySlug.has(slug),
  );
  if (!result.ok) error(400, result.error);
  const saved = await createTeam(locals.user.id, result.value as TeamInput);
  if (saved === "limit")
    error(409, `You can save up to ${MAX_SAVED_TEAMS} teams. Delete one to save another.`);
  return json(saved, { status: 201, headers: noStore });
};
