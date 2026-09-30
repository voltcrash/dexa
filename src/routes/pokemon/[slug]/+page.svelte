<script lang="ts">
	import CounterList from "$lib/components/pokemon/counter-list.svelte";
	import DetailSection from "$lib/components/pokemon/detail-section.svelte";
	import EvolutionChain from "$lib/components/pokemon/evolution-chain.svelte";
	import FormList from "$lib/components/pokemon/form-list.svelte";
	import LearnsetTable from "$lib/components/pokemon/learnset-table.svelte";
	import PokemonAbout from "$lib/components/pokemon/pokemon-about.svelte";
	import PokemonHero from "$lib/components/pokemon/pokemon-hero.svelte";
	import StatBars from "$lib/components/pokemon/stat-bars.svelte";
	import TrainingBreeding from "$lib/components/pokemon/training-breeding.svelte";
	import TwinList from "$lib/components/pokemon/twin-list.svelte";
	import TypeMatchups from "$lib/components/pokemon/type-matchups.svelte";
	import { dexNumber } from "$lib/pokemon/format.js";
	import { artworkUrl } from "$lib/pokemon/sprites.js";

	let { data } = $props();

	const detail = $derived(data.detail);
	const entry = $derived(detail.entry);

	const sections = $derived(
		[
			{ id: "about", label: "About" },
			{ id: "stats", label: "Stats" },
			{ id: "matchups", label: "Matchups" },
			{ id: "counters", label: "Counters" },
			{ id: "similar", label: "Similar" },
			detail.evolution ? { id: "evolution", label: "Evolution" } : false,
			detail.forms.length > 1 && { id: "forms", label: "Forms" },
			{ id: "moves", label: "Moves" },
			{ id: "training", label: "Training" },
		].filter((s): s is { id: string; label: string } => Boolean(s)),
	);
</script>

<svelte:head>
	<title>{entry.name} {dexNumber(entry.speciesId)} | Dexa</title>
	<meta name="description" content="{entry.name}, the {detail.genus}. {detail.flavor[0]?.text ?? ''}" />
	<meta property="og:title" content="{entry.name} | Dexa" />
	<meta property="og:image" content={artworkUrl(entry.id)} />
</svelte:head>

<article style:--tint="var(--type-{entry.types[0]})">
	<PokemonHero {detail} />

	<nav aria-label="Sections" class="sticky top-[6.125rem] z-30 border-b bg-card lg:top-14">
		<ul class="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 [scrollbar-width:none] sm:px-6">
			{#each sections as section (section.id)}
				<li class="shrink-0">
					<a href="#{section.id}" class="block border-y-2 border-transparent py-2.5 text-sm text-muted-foreground hover:border-b-(--tint) hover:text-foreground">
						{section.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-14 px-4 py-10 sm:px-6">
		<DetailSection id="about" title="About">
			<PokemonAbout {detail} />
		</DetailSection>

		<DetailSection id="stats" title="Base stats">
			<div class="max-w-3xl">
				<StatBars stats={entry.stats} percentiles={detail.percentiles} />
			</div>
		</DetailSection>

		<DetailSection id="matchups" title="Type matchups" description="Multipliers use the current type chart. Abilities that change damage taken can be applied.">
			<TypeMatchups types={entry.types} abilities={detail.abilities} />
		</DetailSection>

		<DetailSection id="counters" title="Counters" description="Fully evolved, non-legendary Pokémon that resist all of {entry.name}’s same-type attacks and hit it super effectively. Judged on types alone, strongest first.">
			<CounterList counters={detail.counters} types={entry.types} />
		</DetailSection>

		<DetailSection id="similar" title="Closest stats" description="Other species whose six base stats are nearest to {entry.name}’s.">
			<TwinList twins={detail.twins} slug={entry.slug} />
		</DetailSection>

		{#if detail.evolution}
			<DetailSection id="evolution" title="Evolution">
				<EvolutionChain root={detail.evolution} currentSpeciesId={entry.speciesId} />
			</DetailSection>
		{/if}

		{#if detail.forms.length > 1}
			<DetailSection id="forms" title="Forms" description="Alternate forms have their own types, stats and abilities.">
				<FormList forms={detail.forms} currentId={entry.id} />
			</DetailSection>
		{/if}

		<DetailSection id="moves" title="Moves" description="Moves this Pokémon can learn in the selected game. STAB marks attacks that share its type.">
			{#key entry.id}
				<LearnsetTable initial={detail.learnset} slug={entry.slug} types={entry.types} />
			{/key}
		</DetailSection>

		<DetailSection id="training" title="Training and breeding">
			<TrainingBreeding {detail} />
		</DetailSection>
	</div>
</article>
