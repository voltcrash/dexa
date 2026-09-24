import { redirect } from "@sveltejs/kit";
import { isAuthConfigured } from "$lib/server/auth.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals, setHeaders }) => {
  if (!isAuthConfigured()) return { configured: false };
  if (!locals.user) redirect(303, "/login?redirectTo=/collection");
  setHeaders({ "cache-control": "private, no-store" });
  return { configured: true };
};
