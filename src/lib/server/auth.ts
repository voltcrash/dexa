import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { env } from "$env/dynamic/private";
import { getDb, isDatabaseConfigured } from "./db/index.js";
import * as schema from "./db/schema.js";

function createAuth() {
  const github =
    env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET }
      : undefined;

  return betterAuth({
    appName: "Dexa",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), { provider: "pg", schema }),
    emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
    socialProviders: github ? { github } : {},
    session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
    // Must stay last so cookies set during server actions reach the response.
    plugins: [sveltekitCookies(getRequestEvent)],
  });
}

export type Auth = ReturnType<typeof createAuth>;

let auth: Auth | undefined;

/** Accounts need a database and a secret; without them the app runs signed out. */
export function isAuthConfigured(): boolean {
  return isDatabaseConfigured() && Boolean(env.BETTER_AUTH_SECRET);
}

export function getAuth(): Auth {
  auth ??= createAuth();
  return auth;
}

export function enabledSocialProviders(): string[] {
  return env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? ["github"] : [];
}
