import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  DATABASE_URL: { schema: (input) => input },
  BETTER_AUTH_SECRET: { schema: (input) => input },
  BETTER_AUTH_URL: { schema: (input) => input },
  GITHUB_CLIENT_ID: { schema: (input) => input },
  GITHUB_CLIENT_SECRET: { schema: (input) => input },
});
