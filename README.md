# dexa

The last Pokédex you will ever need.

Built with SvelteKit 3, Tailwind CSS, shadcn-svelte, and data from [PokéAPI](https://pokeapi.co). Deployed on Vercel.

## Getting started

This project uses [Vite+](https://viteplus.dev) (`vp`) with bun as the package manager.
Node.js 22.17 or newer is required; CI and Vercel use Node.js 24.

```sh
vp install
vp dev
```

## Database

Accounts, collections and saved teams are stored in [Neon](https://neon.tech) Postgres through Drizzle ORM. Everything else works without a database.
Server environment variables are declared in `src/env.ts` and read at runtime through `$app/env/private`. They remain optional so the public Pokédex can run without account credentials.

1. Create a Neon project and copy its pooled connection string.
2. `cp .env.example .env` and set `DATABASE_URL`.
3. Apply the migrations:

```sh
vp run db:migrate
```

After changing `src/lib/server/db/schema.ts`, create a migration with `vp run db:generate`. `vp run db:studio` opens Drizzle Studio.

## Pokédex data

Browse, search and move details come from indexes in `src/lib/data`, built from PokéAPI:

```sh
vp run data:sync          # reuse cached responses in .cache/pokeapi
vp run data:sync --fresh  # refetch everything
```

## Validation

```sh
vp check      # format, lint, type check
vp run check  # svelte-check for .svelte files
vp test       # unit tests
```

## Deployment

The app deploys to Vercel with `@sveltejs/adapter-vercel`. Import the repository in Vercel, add the environment variables from `.env.example` (the Neon integration can set `DATABASE_URL` for you), and it builds with `vp build`. Pokémon pages use ISR and remote artwork goes through Vercel image optimization.
