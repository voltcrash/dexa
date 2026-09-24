# dexa

The last Pokédex you will ever need.

Built with SvelteKit, Tailwind CSS, shadcn-svelte, and data from [PokéAPI](https://pokeapi.co). Deployed on Vercel.

## Getting started

This project uses [Vite+](https://viteplus.dev) (`vp`) with bun as the package manager.

```sh
vp install
vp dev
```

## Validation

```sh
vp check      # format, lint, type check
vp run check  # svelte-check for .svelte files
vp test       # unit tests
```

## Deployment

The app deploys to Vercel with `@sveltejs/adapter-vercel`. Import the repository in Vercel and it builds with `vp build`.
