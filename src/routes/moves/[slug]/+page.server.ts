import type { Config } from "@sveltejs/adapter-vercel";
import { getMoveDetail } from "$lib/server/moves.js";
import type { PageServerLoad } from "./$types";

export const config: Config = { isr: { expiration: 60 * 60 * 24 * 7 } };

export const load: PageServerLoad = async ({ params, fetch }) => getMoveDetail(params.slug, fetch);
