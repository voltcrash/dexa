import type { ApiEvolutionDetail } from "$lib/pokeapi/types.js";
import { titleCase } from "./format.js";

const TRIGGERS: Record<string, string> = {
  "level-up": "Level up",
  trade: "Trade",
  "use-item": "Use",
  shed: "Level 20 with a spare slot and Poké Ball",
  spin: "Spin around holding a Sweet",
  "tower-of-darkness": "Train in the Tower of Darkness",
  "tower-of-waters": "Train in the Tower of Waters",
  "three-critical-hits": "Land three critical hits in one battle",
  "take-damage": "Take damage",
  "agile-style-move": "Use an agile style move",
  "strong-style-move": "Use a strong style move",
  "recoil-damage": "Take recoil damage",
  "use-move": "Use a move",
  "gimmighoul-coins": "Collect 999 Gimmighoul Coins",
  other: "Special condition",
};

/** Describe one way a Pokémon evolves, e.g. "Level 36" or "Trade holding Metal Coat". */
export function describeEvolution(detail: ApiEvolutionDetail): string {
  const trigger = detail.trigger.name;
  const parts: string[] = [];

  if (trigger === "level-up") {
    parts.push(detail.min_level ? `Level ${detail.min_level}` : "Level up");
  } else if (trigger === "use-item" && detail.item) {
    parts.push(`Use ${titleCase(detail.item.name)}`);
  } else {
    parts.push(TRIGGERS[trigger] ?? titleCase(trigger));
  }

  if (detail.held_item) parts.push(`holding ${titleCase(detail.held_item.name)}`);
  if (detail.trade_species) parts.push(`for ${titleCase(detail.trade_species.name)}`);
  if (detail.min_happiness) parts.push("with high friendship");
  if (detail.min_affection) parts.push("with high affection");
  if (detail.min_beauty) parts.push("with high beauty");
  if (detail.known_move) parts.push(`knowing ${titleCase(detail.known_move.name)}`);
  if (detail.known_move_type)
    parts.push(`knowing a ${titleCase(detail.known_move_type.name)} move`);
  if (detail.used_move) parts.push(`after using ${titleCase(detail.used_move.name)}`);
  if (detail.min_move_count) parts.push(`${detail.min_move_count} times`);
  if (detail.min_steps) parts.push(`after walking ${detail.min_steps.toLocaleString("en")} steps`);
  if (detail.min_damage_taken) parts.push(`after taking ${detail.min_damage_taken} damage`);
  if (detail.location) parts.push(`at ${titleCase(detail.location.name)}`);
  if (detail.region) parts.push(`in ${titleCase(detail.region.name)}`);
  if (detail.party_species) parts.push(`with ${titleCase(detail.party_species.name)} in the party`);
  if (detail.party_type)
    parts.push(`with a ${titleCase(detail.party_type.name)} type in the party`);
  if (detail.time_of_day) parts.push(`during the ${detail.time_of_day}`);
  if (detail.gender === 1) parts.push("(female)");
  if (detail.gender === 2) parts.push("(male)");
  if (detail.needs_overworld_rain) parts.push("while raining");
  if (detail.turn_upside_down) parts.push("holding the console upside down");
  if (detail.relative_physical_stats === 1) parts.push("with Attack above Defense");
  if (detail.relative_physical_stats === -1) parts.push("with Defense above Attack");
  if (detail.relative_physical_stats === 0) parts.push("with equal Attack and Defense");

  return parts.join(" ");
}
