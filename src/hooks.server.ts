import type { Handle } from "@sveltejs/kit";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { getAuth, isAuthConfigured } from "$lib/server/auth.js";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = null;
  event.locals.session = null;

  if (building || !isAuthConfigured()) return resolve(event);

  const auth = getAuth();
  const result = await auth.api.getSession({ headers: event.request.headers });
  if (result) {
    event.locals.user = result.user;
    event.locals.session = result.session;
  }
  return svelteKitHandler({ event, resolve, auth, building });
};
