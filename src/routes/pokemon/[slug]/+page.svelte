<script lang="ts">
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import DetailSection from "$lib/components/pokemon/detail-section.svelte";
	import FormList from "$lib/components/pokemon/form-list.svelte";
	import PokemonHero from "$lib/components/pokemon/pokemon-hero.svelte";
	import StatBars from "$lib/components/pokemon/stat-bars.svelte";
	import TrainingBreeding from "$lib/components/pokemon/training-breeding.svelte";
	import { dexNumber } from "$lib/pokemon/format.js";
	import { artworkUrl } from "$lib/pokemon/sprites.js";

	let { data } = $props();

	const detail = $derived(data.detail);
	const entry = $derived(detail.entry);

	const sections = $derived(
		[
			{ id: "stats", label: "Stats" },
			detail.forms.length > 1 && { id: "forms", label: "Forms" },
			{ id: "training", label: "Training" },
		].filter((s) => s !== false),
	);
</script>

<svelte:head>
	<title>{entry.name} {dexNumber(entry.speciesId)} | Dexa</title>
	<meta name="description" content="{entry.name}, the {detail.genus}. {detail.flavor[0]?.text ?? ''}" />
	<meta property="og:title" content="{entry.name} | Dexa" />
	<meta property="og:image" content={artworkUrl(entry.id)} />
</svelte:head>

<article style:--tint="var(--type-{entry.types[0]})">
	<div class="border-b bg-[color-mix(in_oklab,var(--tint)_7%,var(--background))]">
		<nav aria-label="Adjacent Pokémon" class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pt-5 text-sm sm:px-6">
			{#if detail.prev}
				<a href="/pokemon/{detail.prev.slug}" class="flex items-center gap-1.5 text-muted-foreground hover:text-foreground" data-sveltekit-preload-data="hover">
					<ArrowLeftIcon class="size-4" />
					<span class="tabular">{dexNumber(detail.prev.speciesId)}</span>
					<span class="hidden sm:inline">{detail.prev.name}</span>
				</a>
			{:else}
				<span></span>
			{/if}
			{#if detail.next}
				<a href="/pokemon/{detail.next.slug}" class="flex items-center gap-1.5 text-muted-foreground hover:text-foreground" data-sveltekit-preload-data="hover">
					<span class="hidden sm:inline">{detail.next.name}</span>
					<span class="tabular">{dexNumber(detail.next.speciesId)}</span>
					<ArrowRightIcon class="size-4" />
				</a>
			{/if}
		</nav>
		<PokemonHero {detail} />
	</div>

	<nav aria-label="Sections" class="sticky top-14 z-30 border-b bg-background/90 backdrop-blur-md">
		<ul class="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:px-6">
			{#each sections as section (section.id)}
				<li class="shrink-0">
					<a href="#{section.id}" class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
						{section.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="mx-auto grid max-w-7xl gap-16 px-4 py-12 sm:px-6">
		<DetailSection id="stats" title="Base stats">
			<div class="max-w-3xl">
				<StatBars stats={entry.stats} />
			</div>
		</DetailSection>

		{#if detail.forms.length > 1}
			<DetailSection id="forms" title="Forms" description="Alternate forms have their own types, stats and abilities.">
				<FormList forms={detail.forms} currentId={entry.id} />
			</DetailSection>
		{/if}

		<DetailSection id="training" title="Training and breeding">
			<TrainingBreeding {detail} />
		</DetailSection>
	</div>
</article>
