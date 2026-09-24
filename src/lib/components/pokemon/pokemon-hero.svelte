<script lang="ts">
	import ScaleIcon from "@lucide/svelte/icons/scale";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
	import UsersIcon from "@lucide/svelte/icons/users";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Toggle } from "$lib/components/ui/toggle/index.js";
	import type { PokemonDetail } from "$lib/pokemon/detail.js";
	import { dexNumber, formatHeight, formatWeight } from "$lib/pokemon/format.js";
	import CollectionButtons from "./collection-buttons.svelte";
	import CryButton from "./cry-button.svelte";
	import FlavorText from "./flavor-text.svelte";
	import GenderRatio from "./gender-ratio.svelte";
	import PokemonArt from "./pokemon-art.svelte";
	import TypeBadge from "./type-badge.svelte";

	let { detail }: { detail: PokemonDetail } = $props();

	let shiny = $state(false);
	const entry = $derived(detail.entry);
	const height = $derived(formatHeight(entry.height));
	const weight = $derived(formatWeight(entry.weight));
</script>

<div class="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14 lg:py-12">
	<div class="mx-auto w-full max-w-[34rem] lg:self-center">
		<div class="tint-field relative aspect-square overflow-hidden rounded-[2.5rem] p-[9%]">
			{#key `${entry.id}-${shiny}`}
				<PokemonArt
					id={entry.id}
					name={shiny ? `Shiny ${entry.name}` : entry.name}
					{shiny}
					eager
					width={512}
					widths={[384, 512, 768]}
					sizes="(min-width: 1024px) 34rem, 90vw"
					class="hero-art drop-shadow-[0_18px_30px_rgb(0_0_0/0.18)]"
				/>
			{/key}
			<div class="absolute bottom-4 left-4 flex gap-2">
			<Toggle
				bind:pressed={shiny}
				variant="outline"
				size="sm"
				aria-label="Show shiny coloring"
				class="bg-background/80 backdrop-blur"
			>
				<SparklesIcon />
				Shiny
			</Toggle>
				<CryButton url={detail.cries.latest} name={entry.name} />
			</div>
		</div>
	</div>

	<div class="flex flex-col justify-center">
		<p class="font-display text-lg font-medium text-[color-mix(in_oklab,var(--tint)_55%,var(--foreground))] tabular">
			{dexNumber(entry.speciesId)}
		</p>
		<h1 class="mt-1 font-display text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
			{entry.name}
		</h1>
		{#if detail.genus}
			<p class="mt-2 text-lg text-muted-foreground">{detail.genus}</p>
		{/if}
		<div class="mt-5 flex flex-wrap items-center gap-2">
			{#each entry.types as type (type)}
				<TypeBadge {type} size="lg" href="/?type={type}" />
			{/each}
			<Button href="/compare?p={entry.slug}" variant="outline" size="sm" class="ml-auto">
				<ScaleIcon />
				Compare
			</Button>
			<Button href="/team?add={entry.slug}" variant="outline" size="sm">
				<UsersIcon />
				Add to team
			</Button>
		</div>

		<div class="mt-5">
			<CollectionButtons pokemonId={entry.id} name={entry.name} />
		</div>

		<div class="mt-8">
			<FlavorText entries={detail.flavor} />
		</div>

		<dl class="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t pt-6 sm:grid-cols-3">
			<div>
				<dt class="text-sm text-muted-foreground">Height</dt>
				<dd class="mt-1 font-medium tabular">{height.metric}</dd>
				<dd class="text-sm text-muted-foreground tabular">{height.imperial}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Weight</dt>
				<dd class="mt-1 font-medium tabular">{weight.metric}</dd>
				<dd class="text-sm text-muted-foreground tabular">{weight.imperial}</dd>
			</div>
			<div class="col-span-2 sm:col-span-1">
				<dt class="text-sm text-muted-foreground">Gender</dt>
				<dd class="mt-1"><GenderRatio rate={detail.breeding.genderRate} /></dd>
			</div>
			<div class="col-span-full">
				<dt class="text-sm text-muted-foreground">Abilities</dt>
				<dd class="mt-2 grid gap-3 sm:grid-cols-2">
					{#each detail.abilities as ability (ability.slug)}
						<div>
							<p class="font-medium">
								{ability.name}
								{#if ability.hidden}
									<span class="ml-1 text-xs font-normal text-muted-foreground">Hidden ability</span>
								{/if}
							</p>
							<p class="text-sm text-muted-foreground">{ability.effect}</p>
						</div>
					{/each}
				</dd>
			</div>
		</dl>
	</div>
</div>

<style>
	:global(.hero-art) {
		animation: hero-in 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}

	@keyframes hero-in {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.94);
		}
	}
</style>
