import { redirect } from "@sveltejs/kit";
import { enabledSocialProviders, isAuthConfigured } from "$lib/server/auth.js";
import { safeRedirect } from "$lib/safe-redirect.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals, url }) => {
  const redirectTo = safeRedirect(url.searchParams.get("redirectTo"));
  if (locals.user) redirect(303, redirectTo);
  return {
    redirectTo,
    configured: isAuthConfigured(),
    socialProviders: isAuthConfigured() ? enabledSocialProviders() : [],
  };
};
