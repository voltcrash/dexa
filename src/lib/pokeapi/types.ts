/** Subset of the PokéAPI v2 response shapes that Dexa reads. */

export interface NamedResource {
  name: string;
  url: string;
}

export interface Paginated<T = NamedResource> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LocalizedName {
  name: string;
  language: NamedResource;
}

export interface ApiPokemon {
  id: number;
  name: string;
  base_experience: number | null;
  height: number;
  weight: number;
  is_default: boolean;
  order: number;
  abilities: { is_hidden: boolean; slot: number; ability: NamedResource }[];
  forms: NamedResource[];
  held_items: {
    item: NamedResource;
    version_details: { rarity: number; version: NamedResource }[];
  }[];
  moves: {
    move: NamedResource;
    version_group_details: {
      level_learned_at: number;
      version_group: NamedResource;
      move_learn_method: NamedResource;
      order: number | null;
    }[];
  }[];
  species: NamedResource;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null; front_shiny: string | null };
      home?: { front_default: string | null; front_shiny: string | null };
      showdown?: { front_default: string | null; front_shiny: string | null };
    };
  };
  cries: { latest: string | null; legacy: string | null };
  stats: { base_stat: number; effort: number; stat: NamedResource }[];
  types: { slot: number; type: NamedResource }[];
  past_types: { generation: NamedResource; types: { slot: number; type: NamedResource }[] }[];
}

export interface ApiPokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number | null;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: NamedResource;
  pokedex_numbers: { entry_number: number; pokedex: NamedResource }[];
  egg_groups: NamedResource[];
  color: NamedResource;
  shape: NamedResource | null;
  evolves_from_species: NamedResource | null;
  evolution_chain: { url: string } | null;
  habitat: NamedResource | null;
  generation: NamedResource;
  names: LocalizedName[];
  flavor_text_entries: { flavor_text: string; language: NamedResource; version: NamedResource }[];
  form_descriptions: { description: string; language: NamedResource }[];
  genera: { genus: string; language: NamedResource }[];
  varieties: { is_default: boolean; pokemon: NamedResource }[];
}

export interface ApiPokemonForm {
  id: number;
  name: string;
  form_name: string;
  is_default: boolean;
  is_battle_only: boolean;
  is_mega: boolean;
  names: LocalizedName[];
  form_names: LocalizedName[];
  pokemon: NamedResource;
  types: { slot: number; type: NamedResource }[];
}

export interface ApiEvolutionDetail {
  trigger: NamedResource;
  item: NamedResource | null;
  held_item: NamedResource | null;
  gender: number | null;
  known_move: NamedResource | null;
  known_move_type: NamedResource | null;
  location: NamedResource | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  needs_overworld_rain: boolean;
  party_species: NamedResource | null;
  party_type: NamedResource | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: NamedResource | null;
  turn_upside_down: boolean;
  region?: NamedResource | null;
  used_move?: NamedResource | null;
  min_move_count?: number | null;
  min_steps?: number | null;
  min_damage_taken?: number | null;
}

export interface ApiChainLink {
  is_baby: boolean;
  species: NamedResource;
  evolution_details: ApiEvolutionDetail[];
  evolves_to: ApiChainLink[];
}

export interface ApiEvolutionChain {
  id: number;
  chain: ApiChainLink;
}

export interface ApiMove {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  priority: number;
  effect_chance: number | null;
  damage_class: NamedResource | null;
  type: NamedResource;
  generation: NamedResource;
  target: NamedResource;
  names: LocalizedName[];
  effect_entries: { effect: string; short_effect: string; language: NamedResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedResource;
    version_group: NamedResource;
  }[];
  learned_by_pokemon: NamedResource[];
}

export interface ApiAbility {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: NamedResource;
  names: LocalizedName[];
  effect_entries: { effect: string; short_effect: string; language: NamedResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedResource;
    version_group: NamedResource;
  }[];
  pokemon: { is_hidden: boolean; slot: number; pokemon: NamedResource }[];
}
