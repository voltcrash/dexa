<script lang="ts">
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import DexTile from "$lib/components/dex/dex-tile.svelte";
	import DamageClassIcon from "$lib/components/pokemon/damage-class-icon.svelte";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import { GENERATIONS } from "$lib/pokemon/generations.js";

	let { data } = $props();

	const move = $derived(data.move);
	const facts = $derived([
		{ label: "Power", value: move.power ?? "—" },
		{ label: "Accuracy", value: move.accuracy === null ? "Never misses" : `${move.accuracy}%` },
		{ label: "PP", value: move.pp ?? "—" },
		{ label: "Priority", value: move.priority > 0 ? `+${move.priority}` : move.priority },
		{ label: "Target", value: data.target },
		{ label: "Introduced", value: `Generation ${GENERATIONS[move.generation - 1]?.numeral ?? move.generation}` },
	]);
</script>

<svelte:head>
	<title>{move.name} | Moves | Dexa</title>
	<meta name="description" content="{move.name}: {move.effect}" />
</svelte:head>

<article style:--tint="var(--type-{move.type})">
	<div class="border-b bg-[color-mix(in_oklab,var(--tint)_9%,var(--background))]">
		<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<a href="/moves" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeftIcon class="size-4" />
				All moves
			</a>
			<h1 class="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-6xl">{move.name}</h1>
			<div class="mt-4 flex flex-wrap items-center gap-2">
				<TypeBadge type={move.type} size="lg" href="/moves?type={move.type}" />
				<DamageClassIcon value={move.damageClass} class="h-8 px-3 text-sm" />
			</div>
			<p class="mt-6 max-w-prose text-lg leading-relaxed text-pretty">{data.effect}</p>
			{#if data.flavor && data.flavor !== data.effect}
				<p class="mt-3 max-w-prose text-muted-foreground">“{data.flavor}”</p>
			{/if}
			<dl class="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t pt-6 sm:grid-cols-3 lg:grid-cols-6">
				{#each facts as fact (fact.label)}
					<div>
						<dt class="text-sm text-muted-foreground">{fact.label}</dt>
						<dd class="mt-1 font-medium tabular">{fact.value}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</div>

	<section aria-labelledby="learned-title" class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
		<h2 id="learned-title" class="font-display text-2xl font-semibold tracking-tight">
			Learned by {data.learnedBy.length} Pokémon
		</h2>
		{#if data.learnedBy.length}
			<ul class="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#each data.learnedBy as entry (entry.id)}
					<li><DexTile {entry} /></li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-muted-foreground">No Pokémon learn this move in the main series games.</p>
		{/if}
	</section>
</article>
