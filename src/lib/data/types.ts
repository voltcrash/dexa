import type { BaseStats, TypeName } from "$lib/pokemon/types.js";

export interface DexEntry {
  /** Pokémon id; default forms share their species' National Dex number. */
  id: number;
  slug: string;
  name: string;
  speciesId: number;
  speciesSlug: string;
  /** Form label such as "Alolan" or "Mega X"; absent on default forms. */
  form?: string;
  isDefault: boolean;
  types: TypeName[];
  stats: BaseStats;
  abilities: { slug: string; hidden: boolean }[];
  generation: number;
  height: number;
  weight: number;
  legendary: boolean;
  mythical: boolean;
  baby: boolean;
  /** Species this one evolves from, if any. */
  evolvesFrom?: number;
  /** True when nothing evolves from this species. */
  final: boolean;
}

export type DamageClass = "physical" | "special" | "status";

export interface MoveEntry {
  id: number;
  slug: string;
  name: string;
  type: TypeName;
  damageClass: DamageClass;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  effect: string;
  generation: number;
}

export interface AbilityEntry {
  id: number;
  slug: string;
  name: string;
  effect: string;
  generation: number;
}
