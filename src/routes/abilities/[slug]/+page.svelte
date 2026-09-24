<script lang="ts">
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import DexTile from "$lib/components/dex/dex-tile.svelte";
	import { GENERATIONS } from "$lib/pokemon/generations.js";

	let { data } = $props();

	const groups = $derived(
		[
			{ id: "regular", title: "As a regular ability", entries: data.regular },
			{ id: "hidden", title: "As a hidden ability", entries: data.hidden },
		].filter((g) => g.entries.length),
	);
</script>

<svelte:head>
	<title>{data.ability.name} | Abilities | Dexa</title>
	<meta name="description" content="{data.ability.name}: {data.ability.effect}" />
</svelte:head>

<article>
	<div class="border-b bg-secondary/40">
		<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<a href="/abilities" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeftIcon class="size-4" />
				All abilities
			</a>
			<h1 class="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-6xl">{data.ability.name}</h1>
			<p class="mt-2 text-muted-foreground">
				Introduced in Generation {GENERATIONS[data.ability.generation - 1]?.numeral ?? data.ability.generation}
			</p>
			<p class="mt-6 max-w-prose text-lg leading-relaxed text-pretty">{data.effect}</p>
			{#if data.flavor && data.flavor !== data.effect}
				<p class="mt-3 max-w-prose text-muted-foreground">“{data.flavor}”</p>
			{/if}
		</div>
	</div>

	<div class="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6">
		{#each groups as group (group.id)}
			<section aria-labelledby="{group.id}-title">
				<h2 id="{group.id}-title" class="font-display text-2xl font-semibold tracking-tight">
					{group.title}
					<span class="text-lg font-medium text-muted-foreground tabular">{group.entries.length}</span>
				</h2>
				<ul class="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{#each group.entries as entry (entry.id)}
						<li><DexTile {entry} /></li>
					{/each}
				</ul>
			</section>
		{:else}
			<p class="text-muted-foreground">No Pokémon have this ability in the main series games.</p>
		{/each}
	</div>
</article>
