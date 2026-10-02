<script lang="ts">
	import type { DexListEntry } from "#lib/dex/list.js";
	import { titleCase } from "#lib/pokemon/format.js";
	import type { Counter } from "#lib/pokemon/insights.js";
	import { formatMultiplier } from "#lib/pokemon/matchups.js";
	import type { TypeName } from "#lib/pokemon/types.js";
	import PokemonArt from "./pokemon-art.svelte";
	import TypeBadge from "./type-badge.svelte";

	let { counters, types }: { counters: Counter<DexListEntry>[]; types: TypeName[] } = $props();

	const attacks = $derived(types.map(titleCase).join(" and "));
</script>

{#if counters.length}
	<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each counters as { entry, attack, takes } (entry.id)}
			<li>
				<a
					href="/pokemon/{entry.slug}"
					class="flex items-center gap-3 rounded-lg border bg-card p-2 pr-3 transition-colors hover:border-(--tint)"
					style:--tint="var(--type-{entry.types[0]})"
					data-sveltekit-preload-data="hover"
				>
					<span class="tint-field grid size-16 shrink-0 place-items-center rounded-md p-1">
						<PokemonArt id={entry.id} name="" width={96} widths={[96, 192]} sizes="64px" />
					</span>
					<span class="min-w-0 flex-1">
						<span class="block truncate font-medium">{entry.name}</span>
						<span class="mt-1 flex items-center gap-1.5 text-sm">
							<TypeBadge type={attack.type} size="sm" />
							<span class="font-medium tabular">{formatMultiplier(attack.multiplier)}</span>
							<span class="text-muted-foreground">against it</span>
						</span>
						<span class="mt-0.5 block text-sm text-muted-foreground">
							{takes === 0 ? "Immune to" : "Resists"} its {attacks} attacks
						</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
{:else}
	<p class="text-sm text-muted-foreground">
		No fully evolved Pokémon both resists every one of its same-type attacks and hits it super effectively.
	</p>
{/if}
