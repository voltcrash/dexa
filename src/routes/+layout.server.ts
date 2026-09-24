import { isAuthConfigured } from "$lib/server/auth.js";
import type { LayoutServerLoad } from "./$types";

// Pages are cached by the CDN and ISR, so nothing user-specific may be returned here;
// the header reads the session in the browser instead.
export const load: LayoutServerLoad = () => ({ accountsEnabled: isAuthConfigured() });
