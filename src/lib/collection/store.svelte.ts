import { toast } from "svelte-sonner";
import { SvelteMap } from "svelte/reactivity";
import { isEmpty, type CollectionFlag, type CollectionState } from "./types.js";

const EMPTY = { caught: false, shiny: false, favorite: false };

class CollectionStore {
  entries = new SvelteMap<number, CollectionState>();
  status = $state<"idle" | "loading" | "ready" | "signed-out">("idle");
  #request: Promise<void> | undefined;

  get(pokemonId: number): CollectionState {
    return this.entries.get(pokemonId) ?? { pokemonId, ...EMPTY };
  }

  load(): Promise<void> {
    this.#request ??= (async () => {
      this.status = "loading";
      const response = await fetch("/api/collection");
      if (response.status === 401) {
        this.status = "signed-out";
        return;
      }
      if (!response.ok) throw new Error(String(response.status));
      const list = (await response.json()) as CollectionState[];
      this.entries.clear();
      for (const entry of list) this.entries.set(entry.pokemonId, entry);
      this.status = "ready";
    })().catch(() => {
      this.status = "idle";
      this.#request = undefined;
    });
    return this.#request;
  }

  reset() {
    this.entries.clear();
    this.status = "signed-out";
    this.#request = undefined;
  }

  /** Update optimistically, then reconcile with the server or roll back. */
  async set(pokemonId: number, flags: Partial<Record<CollectionFlag, boolean>>) {
    const previous = this.get(pokemonId);
    const next = { ...previous, ...flags };
    if (isEmpty(next)) this.entries.delete(pokemonId);
    else this.entries.set(pokemonId, next);

    try {
      const response = await fetch(`/api/collection/${pokemonId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(flags),
      });
      if (!response.ok) throw new Error(String(response.status));
    } catch {
      if (isEmpty(previous)) this.entries.delete(pokemonId);
      else this.entries.set(pokemonId, previous);
      toast.error("Couldn’t save that change. Check your connection and try again.");
    }
  }

  toggle(pokemonId: number, flag: CollectionFlag) {
    return this.set(pokemonId, { [flag]: !this.get(pokemonId)[flag] });
  }
}

export const collection = new CollectionStore();
