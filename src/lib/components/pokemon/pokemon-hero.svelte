<script lang="ts">
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import ScaleIcon from "@lucide/svelte/icons/scale";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
	import UsersIcon from "@lucide/svelte/icons/users";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Toggle } from "$lib/components/ui/toggle/index.js";
	import type { PokemonDetail } from "$lib/pokemon/detail.js";
	import { dexNumber } from "$lib/pokemon/format.js";
	import CollectionButtons from "./collection-buttons.svelte";
	import CryButton from "./cry-button.svelte";
	import PokemonArt from "./pokemon-art.svelte";
	import TypeBadge from "./type-badge.svelte";

	let { detail }: { detail: PokemonDetail } = $props();

	let shiny = $state(false);
	const entry = $derived(detail.entry);
</script>

<div class="dark type-band">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<nav aria-label="Adjacent Pokémon" class="flex items-center justify-between gap-4 pt-4 text-sm">
			{#if detail.prev}
				<a href="/pokemon/{detail.prev.slug}" class="flex items-center gap-1.5 text-muted-foreground hover:text-foreground" data-sveltekit-preload-data="hover">
					<ArrowLeftIcon class="size-4" />
					<span class="tabular font-condensed">{dexNumber(detail.prev.speciesId)}</span>
					<span class="hidden sm:inline">{detail.prev.name}</span>
				</a>
			{:else}
				<span></span>
			{/if}
			{#if detail.next}
				<a href="/pokemon/{detail.next.slug}" class="flex items-center gap-1.5 text-muted-foreground hover:text-foreground" data-sveltekit-preload-data="hover">
					<span class="hidden sm:inline">{detail.next.name}</span>
					<span class="tabular font-condensed">{dexNumber(detail.next.speciesId)}</span>
					<ArrowRightIcon class="size-4" />
				</a>
			{/if}
		</nav>

		<div class="grid items-center gap-6 pt-4 pb-8 md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_26rem] lg:pb-10">
			<div class="order-2 md:order-1">
				<p class="font-display text-xl font-medium text-muted-foreground">{dexNumber(entry.speciesId)}</p>
				<h1 class="mt-1 font-display text-5xl leading-[0.95] font-bold tracking-tight text-balance sm:text-7xl">
					{entry.name}
				</h1>
				{#if detail.genus}
					<p class="mt-3 text-lg text-muted-foreground">{detail.genus}</p>
				{/if}
				<div class="mt-5 flex flex-wrap gap-1.5">
					{#each entry.types as type (type)}
						<TypeBadge {type} size="lg" href="/?type={type}" />
					{/each}
				</div>

				<div class="mt-8 flex flex-wrap gap-2">
					<Button href="/compare?p={entry.slug}" variant="outline" size="sm">
						<ScaleIcon />
						Compare
					</Button>
					<Button href="/team?add={entry.slug}" variant="outline" size="sm">
						<UsersIcon />
						Add to team
					</Button>
				</div>
				<div class="mt-2">
					<CollectionButtons pokemonId={entry.id} name={entry.name} />
				</div>
			</div>

			<div class="order-1 mx-auto w-full max-w-72 md:order-2 md:max-w-none">
				{#key `${entry.id}-${shiny}`}
					<PokemonArt
						id={entry.id}
						name={shiny ? `Shiny ${entry.name}` : entry.name}
						{shiny}
						eager
						width={512}
						widths={[384, 512, 768]}
						sizes="(min-width: 1024px) 26rem, (min-width: 768px) 20rem, 18rem"
						class="hero-art drop-shadow-[0_16px_24px_rgb(0_0_0/0.35)]"
					/>
				{/key}
				<div class="mt-2 flex justify-center gap-2">
					<Toggle bind:pressed={shiny} variant="outline" size="sm" aria-label="Show shiny coloring">
						<SparklesIcon />
						Shiny
					</Toggle>
					<CryButton url={detail.cries.latest} name={entry.name} />
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.hero-art) {
		animation: hero-in 600ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}

	@keyframes hero-in {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
	}
</style>
