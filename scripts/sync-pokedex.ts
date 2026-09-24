/**
 * Builds the static Pokédex indexes in src/lib/data from PokéAPI.
 * Responses are cached in .cache/pokeapi so reruns are fast and polite to the API.
 *
 *   vp run data:sync            # use cached responses when present
 *   vp run data:sync --fresh    # refetch everything
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ApiAbility,
  ApiMove,
  ApiPokemon,
  ApiPokemonForm,
  ApiPokemonSpecies,
  Paginated,
} from "../src/lib/pokeapi/types.ts";
import { toAbilityEntry, toDexEntry, toMoveEntry } from "../src/lib/data/transform.ts";
import type { DexEntry } from "../src/lib/data/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = join(root, ".cache/pokeapi");
const outDir = join(root, "src/lib/data");
const fresh = process.argv.includes("--fresh");
const CONCURRENCY = 12;

// Totem forms are in-game boss variants with no distinct data worth listing.
const EXCLUDED = /-totem(-|$)/;

async function get<T>(pathOrUrl: string): Promise<T> {
  const path = pathOrUrl.replace("https://pokeapi.co/api/v2/", "").replace(/^\/|\/$/g, "");
  const file = join(cacheDir, `${path.replace(/[/?=&]/g, "_")}.json`);
  if (!fresh) {
    try {
      return JSON.parse(await readFile(file, "utf8")) as T;
    } catch {
      // not cached yet
    }
  }
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`https://pokeapi.co/api/v2/${path}`);
    if (response.ok) {
      const text = await response.text();
      await writeFile(file, text);
      return JSON.parse(text) as T;
    }
    if (attempt >= 4 || response.status === 404) {
      throw new Error(`${response.status} for ${path}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
  }
}

async function mapPool<T, R>(items: T[], fn: (item: T) => Promise<R>, label: string): Promise<R[]> {
  const results = Array.from<R>({ length: items.length });
  let next = 0;
  let done = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
      done++;
      if (done % 100 === 0 || done === items.length) {
        process.stdout.write(`\r${label}: ${done}/${items.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");
  return results;
}

async function list(resource: string) {
  const page = await get<Paginated>(`${resource}?limit=100000`);
  return page.results;
}

async function buildPokemon(): Promise<DexEntry[]> {
  const speciesList = await list("pokemon-species");
  const species = await mapPool(speciesList, (s) => get<ApiPokemonSpecies>(s.url), "species");
  const speciesByName = new Map(species.map((s) => [s.name, s]));
  const evolvedFrom = new Set(
    species.flatMap((s) =>
      s.evolves_from_species ? [Number(/\/(\d+)\/$/.exec(s.evolves_from_species.url)?.[1])] : [],
    ),
  );

  const pokemonList = (await list("pokemon")).filter((p) => !EXCLUDED.test(p.name));
  const entries = await mapPool(
    pokemonList,
    async (resource) => {
      const pokemon = await get<ApiPokemon>(resource.url);
      const sp = speciesByName.get(pokemon.species.name);
      if (!sp) return null;
      const form =
        !pokemon.is_default && pokemon.forms[0]
          ? await get<ApiPokemonForm>(pokemon.forms[0].url)
          : undefined;
      return toDexEntry(pokemon, sp, form, evolvedFrom);
    },
    "pokemon",
  );

  return entries
    .filter((e): e is DexEntry => e !== null)
    .sort(
      (a, b) =>
        a.speciesId - b.speciesId || Number(b.isDefault) - Number(a.isDefault) || a.id - b.id,
    );
}

async function buildMoves() {
  const moves = await mapPool(await list("move"), (m) => get<ApiMove>(m.url), "moves");
  return moves
    .map(toMoveEntry)
    .filter((m) => m !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function buildAbilities() {
  const abilities = await mapPool(
    await list("ability"),
    (a) => get<ApiAbility>(a.url),
    "abilities",
  );
  return abilities
    .map(toAbilityEntry)
    .filter((a) => a !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function write(name: string, data: unknown[]) {
  const json = `[\n${data.map((d) => JSON.stringify(d)).join(",\n")}\n]\n`;
  await writeFile(join(outDir, `${name}.json`), json);
  console.log(`wrote ${name}.json (${data.length} entries, ${(json.length / 1024).toFixed(0)} KB)`);
}

await mkdir(cacheDir, { recursive: true });
await write("pokemon", await buildPokemon());
await write("moves", await buildMoves());
await write("abilities", await buildAbilities());
