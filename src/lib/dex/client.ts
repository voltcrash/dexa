import type { DexListEntry } from "./list.js";

let request: Promise<DexListEntry[]> | undefined;

/** Load the full browse index once per session; it is a static, CDN-cached file. */
export function loadDexList(fetchFn: typeof fetch = fetch): Promise<DexListEntry[]> {
  request ??= fetchFn("/api/dex.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Could not load the Pokédex (${response.status})`);
      return response.json() as Promise<DexListEntry[]>;
    })
    .catch((error: unknown) => {
      request = undefined;
      throw error;
    });
  return request;
}
