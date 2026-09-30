<script lang="ts">
	import type { DexListEntry } from "$lib/dex/list.js";
	import type { StatTwin } from "$lib/pokemon/insights.js";
	import PokemonArt from "./pokemon-art.svelte";
	import StatShape from "./stat-shape.svelte";

	let { twins, slug }: { twins: StatTwin<DexListEntry>[]; slug: string } = $props();
</script>

<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
	{#each twins as { entry, gap } (entry.id)}
		<li class="flex items-center gap-3 rounded-lg border bg-card p-2 pr-3" style:--tint="var(--type-{entry.types[0]})">
			<span class="tint-field grid size-16 shrink-0 place-items-center rounded-md p-1">
				<PokemonArt id={entry.id} name="" width={96} widths={[96, 192]} sizes="64px" />
			</span>
			<span class="min-w-0 flex-1">
				<a href="/pokemon/{entry.slug}" class="block truncate font-medium hover:underline hover:underline-offset-4" data-sveltekit-preload-data="hover">
					{entry.name}
				</a>
				<span class="block text-sm text-muted-foreground">
					{gap === 0 ? "Identical base stats" : `About ${gap} apart per stat`}
				</span>
				<a href="/compare?p={slug},{entry.slug}" class="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Compare</a>
			</span>
			<StatShape stats={entry.stats} class="size-12" />
		</li>
	{/each}
</ul>
