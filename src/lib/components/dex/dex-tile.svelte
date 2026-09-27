<script lang="ts">
	import PokemonArt from "$lib/components/pokemon/pokemon-art.svelte";
	import StatShape from "$lib/components/pokemon/stat-shape.svelte";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import type { DexListEntry } from "$lib/dex/list.js";
	import { dexNumber } from "$lib/pokemon/format.js";

	let {
		entry,
		highlight,
		eager = false,
	}: { entry: DexListEntry; highlight?: { label: string; value: number }; eager?: boolean } =
		$props();
</script>

<a
	href="/pokemon/{entry.slug}"
	class="group block rounded-lg border bg-card p-1.5 transition-colors hover:border-(--tint)"
	style:--tint="var(--type-{entry.types[0]})"
	data-sveltekit-preload-data="hover"
>
	<div class="tint-field relative overflow-hidden rounded-md p-[8%]">
		<PokemonArt id={entry.id} name={entry.name} {eager} />
		{#if highlight}
			<span
				class="absolute top-1.5 right-1.5 rounded-sm bg-card px-1.5 py-0.5 text-xs font-medium tabular"
			>
				<span class="text-muted-foreground">{highlight.label}</span>
				{highlight.value}
			</span>
		{/if}
	</div>
	<div class="relative px-1.5 pt-2 pb-1">
		<StatShape stats={entry.stats} class="absolute top-2 right-1.5 size-7" />
		<p class="text-xs text-muted-foreground tabular font-condensed">{dexNumber(entry.speciesId)}</p>
		<p class="leading-snug font-medium text-balance group-hover:underline group-hover:underline-offset-4">
			{entry.name}
		</p>
		<div class="mt-1.5 flex flex-wrap gap-1">
			{#each entry.types as type (type)}
				<TypeBadge {type} size="sm" />
			{/each}
		</div>
	</div>
</a>
