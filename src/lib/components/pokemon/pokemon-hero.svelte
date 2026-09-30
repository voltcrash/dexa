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
	import { statRole } from "$lib/pokemon/role.js";
	import CollectionButtons from "./collection-buttons.svelte";
	import CryButton from "./cry-button.svelte";
	import FittedName from "./fitted-name.svelte";
	import PokemonArt from "./pokemon-art.svelte";
	import ShapePortrait from "./shape-portrait.svelte";
	import TypeBadge from "./type-badge.svelte";

	let { detail }: { detail: PokemonDetail } = $props();

	let shiny = $state(false);
	const entry = $derived(detail.entry);
	const role = $derived(statRole(entry.stats));
	const roleQuery = $derived(`role:${role.label.toLowerCase().replaceAll(" ", "-")}`);
</script>

<div class="dark type-band overflow-hidden">
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

		<div class="grid items-center gap-x-10 gap-y-4 pt-2 pb-8 md:grid-cols-[minmax(0,1fr)_22rem] lg:grid-cols-[minmax(0,1fr)_28rem] lg:pb-10">
			<div class="order-2 min-w-0 md:order-1">
				<p class="font-display text-xl font-medium text-muted-foreground">{dexNumber(entry.speciesId)}</p>
				<FittedName name={entry.name} />
				{#if detail.genus}
					<p class="mt-3 text-lg text-muted-foreground">{detail.genus}</p>
				{/if}
				<div class="mt-5 flex flex-wrap gap-1.5">
					{#each entry.types as type (type)}
						<TypeBadge {type} size="lg" href="/?type={type}" />
					{/each}
				</div>

				<p class="mt-6 max-w-md text-pretty">
					<a href="/?q={encodeURIComponent(roleQuery)}" class="font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground" title="Find every {role.label.toLowerCase()}">{role.label}.</a>
					<span class="text-muted-foreground">{role.description}</span>
				</p>

				<div class="mt-6 flex flex-wrap gap-2">
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

			<div class="order-1 mx-auto w-full max-w-80 md:order-2 md:max-w-none">
				<ShapePortrait stats={entry.stats}>
					{#key `${entry.id}-${shiny}`}
						<PokemonArt
							id={entry.id}
							name={shiny ? `Shiny ${entry.name}` : entry.name}
							{shiny}
							eager
							width={384}
							widths={[256, 384, 512]}
							sizes="(min-width: 1024px) 15rem, (min-width: 768px) 12rem, 11rem"
							class="hero-art drop-shadow-[0_12px_18px_rgb(0_0_0/0.4)]"
						/>
					{/key}
				</ShapePortrait>
				<div class="mt-3 flex justify-center gap-2">
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
