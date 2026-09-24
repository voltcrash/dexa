import { error, json } from "@sveltejs/kit";
import { pokemonBySlug } from "$lib/server/dex.js";
import { deleteTeam, updateTeam } from "$lib/server/teams.js";
import { validateTeamInput } from "$lib/team/validate.js";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ locals, params, request }) => {
  if (!locals.user) error(401, "Sign in to edit teams");
  const result = validateTeamInput(
    await request.json().catch(() => null),
    (slug) => pokemonBySlug.has(slug),
    true,
  );
  if (!result.ok) error(400, result.error);
  const saved = await updateTeam(locals.user.id, params.id, result.value);
  if (!saved) error(404, "That team doesn’t exist or isn’t yours");
  return json(saved);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) error(401, "Sign in to delete teams");
  if (!(await deleteTeam(locals.user.id, params.id)))
    error(404, "That team doesn’t exist or isn’t yours");
  return new Response(null, { status: 204 });
};
