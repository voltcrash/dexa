import { error, json } from "@sveltejs/kit";
import { getCollection } from "$lib/server/collection.js";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, "Sign in to see your collection");
  return json(await getCollection(locals.user.id), {
    headers: { "cache-control": "private, no-store" },
  });
};
