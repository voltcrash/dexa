<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import XIcon from "@lucide/svelte/icons/x";
	import { onMount } from "svelte";
	import { replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import DexTile from "$lib/components/dex/dex-tile.svelte";
	import FilterControls from "$lib/components/dex/filter-controls.svelte";
	import TypeFilter from "$lib/components/dex/type-filter.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { loadDexList } from "$lib/dex/client.js";
	import {
		DEFAULT_QUERY,
		isFiltered,
		queryDex,
		statTotal,
		toSearchParams,
		type DexListEntry,
		type DexQuery,
	} from "$lib/dex/list.js";
	import { STAT_KEYS, STAT_LABELS, type StatKey } from "$lib/pokemon/types.js";

	let { data } = $props();

	const PAGE_SIZE = 60;

	// Local state that resets whenever a real navigation brings new data.
	let query = $derived<DexQuery>({ ...data.query });
	let all = $state<DexListEntry[] | null>(null);
	let limit = $state(PAGE_SIZE);

	const results = $derived(all ? queryDex(all, query) : data.initial);
	const total = $derived(all ? results.length : data.total);
	const visible = $derived(results.slice(0, limit));
	const count = new Intl.NumberFormat("en");

	onMount(() => {
		loadDexList().then((entries) => (all = entries));
	});

	function update(next: Partial<DexQuery>) {
		query = { ...query, ...next };
		limit = PAGE_SIZE;
		const search = toSearchParams(query).toString().replaceAll("%2C", ",");
		replaceState(search ? `?${search}` : page.url.pathname, page.state);
	}

	function highlight(entry: DexListEntry) {
		if (query.sort === "total") return { label: "BST", value: statTotal(entry) };
		if (query.sort === "dex" || query.sort === "name") return undefined;
		const key = query.sort as StatKey;
		return { label: STAT_LABELS[key].short, value: entry.stats[STAT_KEYS.indexOf(key)] };
	}

	function loadMore(node: HTMLElement) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && limit < results.length) limit += PAGE_SIZE;
			},
			{ rootMargin: "800px" },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}
</script>

<svelte:head>
	<title>Dexa: the Pokédex</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6">
	<div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
		<h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Pokédex</h1>
		<p class="text-muted-foreground tabular">{count.format(data.speciesCount)} species across nine generations</p>
	</div>

	<div class="mt-8 grid gap-4">
		<div class="relative">
			<SearchIcon class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				value={query.q}
				oninput={(event) => update({ q: event.currentTarget.value })}
				placeholder="Search by name or number"
				aria-label="Search Pokémon"
				autocomplete="off"
				spellcheck={false}
				class="h-12 rounded-xl bg-card pr-10 pl-11 text-base md:text-base"
			/>
			{#if query.q}
				<button
					type="button"
					onclick={() => update({ q: "" })}
					class="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
					aria-label="Clear search"
				>
					<XIcon class="size-4" />
				</button>
			{/if}
		</div>

		<TypeFilter selected={query.types} onchange={(types) => update({ types })} />
		<FilterControls {query} onchange={update} />
	</div>

	<div class="mt-6 flex h-8 items-center gap-3 text-sm text-muted-foreground" aria-live="polite">
		<span class="tabular">{count.format(total)} {total === 1 ? "result" : "results"}</span>
		{#if isFiltered(query)}
			<Button variant="link" size="sm" class="h-auto px-0" onclick={() => update({ ...DEFAULT_QUERY, sort: query.sort, desc: query.desc })}>
				Clear filters
			</Button>
		{/if}
	</div>

	{#if visible.length}
		<ul class="mt-2 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each visible as entry, index (entry.id)}
				<li>
					<DexTile {entry} highlight={highlight(entry)} eager={index < 12} />
				</li>
			{/each}
		</ul>
		{#if all && limit < results.length}
			<div {@attach loadMore} class="h-px" aria-hidden="true"></div>
		{/if}
	{:else}
		<Empty.Root class="mt-6 border">
			<Empty.Header>
				<Empty.Title>No Pokémon match these filters</Empty.Title>
				<Empty.Description>Try another spelling, or remove a type or generation filter.</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button variant="outline" onclick={() => update({ ...DEFAULT_QUERY })}>Clear filters</Button>
			</Empty.Content>
		</Empty.Root>
	{/if}
</div>
