<script lang="ts">
	import PokemonArt from "$lib/components/pokemon/pokemon-art.svelte";
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
	class="group block rounded-2xl outline-offset-4"
	style:--tint="var(--type-{entry.types[0]})"
	data-sveltekit-preload-data="hover"
>
	<div class="tint-field relative overflow-hidden rounded-2xl p-[8%]">
		<PokemonArt
			id={entry.id}
			name={entry.name}
			{eager}
			class="transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04]"
		/>
		{#if highlight}
			<span
				class="absolute top-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium tabular backdrop-blur"
			>
				<span class="text-muted-foreground">{highlight.label}</span>
				{highlight.value}
			</span>
		{/if}
	</div>
	<div class="px-1 pt-2.5">
		<p class="text-xs text-muted-foreground tabular">{dexNumber(entry.speciesId)}</p>
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
