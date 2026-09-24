import type { NamedResource } from "./types.js";

export const POKEAPI_BASE = "https://pokeapi.co/api/v2";

export class PokeApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`PokéAPI responded ${status} for ${path}`);
    this.name = "PokeApiError";
  }
}

type Fetch = typeof fetch;

const MAX_CACHE_ENTRIES = 500;
const cache = new Map<string, Promise<unknown>>();

function remember<T>(key: string, value: Promise<T>): Promise<T> {
  cache.set(key, value);
  if (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  // Failed requests must not poison the cache.
  value.catch(() => cache.delete(key));
  return value;
}

/** Turn a full PokéAPI URL or a relative path into a path like `pokemon/6`. */
export function toPath(pathOrUrl: string): string {
  const path = pathOrUrl.startsWith(POKEAPI_BASE)
    ? pathOrUrl.slice(POKEAPI_BASE.length)
    : pathOrUrl;
  return path.replace(/^\/+|\/+$/g, "");
}

/** Fetch a PokéAPI resource, sharing in-flight and completed requests. */
export function pokeapi<T>(pathOrUrl: string, fetchFn: Fetch = fetch): Promise<T> {
  const path = toPath(pathOrUrl);
  const hit = cache.get(path);
  if (hit) return hit as Promise<T>;

  const request = fetchFn(`${POKEAPI_BASE}/${path}/`, {
    headers: { accept: "application/json" },
  }).then(async (response) => {
    if (!response.ok) throw new PokeApiError(response.status, path);
    return (await response.json()) as T;
  });
  return remember(path, request);
}

/** Read the numeric id from a resource URL such as `.../pokemon-species/6/`. */
export function idFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match) throw new Error(`No id in resource URL: ${url}`);
  return Number(match[1]);
}

export function idOf(resource: NamedResource): number {
  return idFromUrl(resource.url);
}

export function clearPokeApiCache() {
  cache.clear();
}
