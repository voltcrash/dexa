<script lang="ts">
	import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
	import HeartIcon from "@lucide/svelte/icons/heart";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
	import { onMount } from "svelte";
	import { collection } from "$lib/collection/store.svelte.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";
	import { loadDexList } from "$lib/dex/client.js";
	import type { DexListEntry } from "$lib/dex/list.js";
	import { optimizedImage } from "$lib/images.js";
	import { dexNumber } from "$lib/pokemon/format.js";
	import { GENERATIONS } from "$lib/pokemon/generations.js";
	import { artworkUrl } from "$lib/pokemon/sprites.js";
	import { cn } from "$lib/utils.js";

	let { data } = $props();

	type View = "all" | "caught" | "missing" | "shiny" | "favorite";
	let view = $state<View>("all");
	let species = $state<DexListEntry[]>([]);
	let limit = $state(120);

	onMount(async () => {
		species = (await loadDexList()).filter((e) => e.isDefault);
	});

	const count = new Intl.NumberFormat("en");
	const caughtCount = $derived(species.filter((s) => collection.get(s.id).caught).length);
	const shinyCount = $derived(species.filter((s) => collection.get(s.id).shiny).length);
	const favoriteCount = $derived(species.filter((s) => collection.get(s.id).favorite).length);
	const byGeneration = $derived(
		GENERATIONS.map((gen) => {
			const inGen = species.filter((s) => s.generation === gen.id);
			return { gen, total: inGen.length, caught: inGen.filter((s) => collection.get(s.id).caught).length };
		}),
	);

	const visible = $derived(
		species.filter((s) => {
			const state = collection.get(s.id);
			if (view === "caught") return state.caught;
			if (view === "missing") return !state.caught;
			if (view === "shiny") return state.shiny;
			if (view === "favorite") return state.favorite;
			return true;
		}),
	);

	$effect(() => {
		void view;
		limit = 120;
	});

	function loadMore(node: HTMLElement) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) limit += 120;
			},
			{ rootMargin: "600px" },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}

	const percent = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);
</script>

<svelte:head>
	<title>Your collection | Dexa</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6">
	<h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Your collection</h1>

	{#if !data.configured}
		<p class="mt-6 text-muted-foreground">Accounts aren’t set up on this deployment, so collections can’t be saved.</p>
	{:else if !species.length || collection.status !== "ready"}
		<div class="mt-8 grid gap-4">
			<Skeleton class="h-24 w-full rounded-2xl" />
			<Skeleton class="h-64 w-full rounded-2xl" />
		</div>
	{:else}
		<p class="mt-3 max-w-prose text-muted-foreground">
			Tap a Pokémon to mark it caught. Your living dex is saved to your account.
		</p>

		<section aria-labelledby="progress-title" class="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
			<div class="rounded-2xl border bg-card p-6">
				<h2 id="progress-title" class="sr-only">Progress</h2>
				<p class="font-display text-5xl font-semibold tabular">
					{count.format(caughtCount)}
					<span class="text-2xl font-medium text-muted-foreground">of {count.format(species.length)}</span>
				</p>
				<p class="mt-1 text-muted-foreground">species caught, {percent(caughtCount, species.length)}% of the National Dex</p>
				<Progress value={caughtCount} max={species.length} class="mt-5 h-2.5" aria-label="National Dex progress" />
				<dl class="mt-6 flex gap-8 text-sm">
					<div>
						<dt class="text-muted-foreground">Shiny</dt>
						<dd class="text-lg font-semibold tabular">{shinyCount}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Favorites</dt>
						<dd class="text-lg font-semibold tabular">{favoriteCount}</dd>
					</div>
				</dl>
			</div>
			<div class="rounded-2xl border bg-card p-6">
				<h3 class="font-medium">By generation</h3>
				<dl class="mt-4 grid gap-2.5">
					{#each byGeneration as row (row.gen.id)}
						<div class="grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-3 text-sm">
							<dt class="text-muted-foreground">{row.gen.region}</dt>
							<dd><Progress value={row.caught} max={row.total} class="h-2" aria-label="{row.gen.region} progress" /></dd>
							<dd class="text-right tabular">{row.caught}/{row.total}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</section>

		<Tabs.Root value={view} onValueChange={(value) => (view = value as View)} class="mt-10">
			<Tabs.List>
				<Tabs.Trigger value="all">All</Tabs.Trigger>
				<Tabs.Trigger value="caught">Caught</Tabs.Trigger>
				<Tabs.Trigger value="missing">Missing</Tabs.Trigger>
				<Tabs.Trigger value="shiny">Shiny</Tabs.Trigger>
				<Tabs.Trigger value="favorite">Favorites</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

		{#if visible.length}
			<ul class="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
				{#each visible.slice(0, limit) as entry (entry.id)}
					{@const state = collection.get(entry.id)}
					<li class="relative">
						<button
							type="button"
							aria-pressed={state.caught}
							aria-label="{entry.name}: {state.caught ? 'caught' : 'not caught'}"
							onclick={() => collection.toggle(entry.id, 'caught')}
							style:--tint="var(--type-{entry.types[0]})"
							class={cn(
								"flex w-full flex-col items-center rounded-xl border p-2 text-center transition-colors",
								state.caught ? "tint-field border-transparent" : "bg-card hover:border-foreground/30",
							)}
						>
							<img
								src={optimizedImage(artworkUrl(entry.id), 96)}
								alt=""
								width="72"
								height="72"
								loading="lazy"
								class={cn("size-16 object-contain transition", !state.caught && "opacity-40 grayscale")}
							/>
							<span class="mt-1 text-[0.6875rem] text-muted-foreground tabular">{dexNumber(entry.speciesId)}</span>
							<span class="w-full truncate text-xs font-medium">{entry.name}</span>
						</button>
						<span class="pointer-events-none absolute top-1.5 right-1.5 flex gap-0.5 text-foreground">
							{#if state.caught}<CircleCheckIcon class="size-3.5" aria-hidden="true" />{/if}
							{#if state.shiny}<SparklesIcon class="size-3.5" aria-hidden="true" />{/if}
							{#if state.favorite}<HeartIcon class="size-3.5 fill-current" aria-hidden="true" />{/if}
						</span>
					</li>
				{/each}
			</ul>
			{#if limit < visible.length}
				<div {@attach loadMore} class="h-px" aria-hidden="true"></div>
			{/if}
		{:else}
			<p class="mt-8 text-muted-foreground">
				{view === "caught" ? "Nothing caught yet. Tap a Pokémon under All to start." : "Nothing here yet."}
			</p>
		{/if}
	{/if}
</div>
