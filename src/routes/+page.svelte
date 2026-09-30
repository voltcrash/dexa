<script lang="ts">
	import LayoutGridIcon from "@lucide/svelte/icons/layout-grid";
	import ListIcon from "@lucide/svelte/icons/list";
	import SearchIcon from "@lucide/svelte/icons/search";
	import XIcon from "@lucide/svelte/icons/x";
	import { onMount } from "svelte";
	import { replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import DexTable from "$lib/components/dex/dex-table.svelte";
	import DexTile from "$lib/components/dex/dex-tile.svelte";
	import DexWall from "$lib/components/dex/dex-wall.svelte";
	import FilterControls from "$lib/components/dex/filter-controls.svelte";
	import TypeFilter from "$lib/components/dex/type-filter.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
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
	import { WALL_COLORS, decodeWallTypes, heatThresholds, type WallColor } from "$lib/dex/wall.js";
	import { STAT_KEYS, STAT_LABELS, type StatKey } from "$lib/pokemon/types.js";

	let { data } = $props();

	const PAGE_SIZE = 60;

	// Local state that resets whenever a real navigation brings new data.
	let query = $derived<DexQuery>({ ...data.query });
	let all = $state<DexListEntry[] | null>(null);
	let limit = $state(PAGE_SIZE);
	let view = $derived(data.view);
	let color = $derived<WallColor>(data.color);

	const results = $derived(all ? queryDex(all, query) : data.initial);
	const total = $derived(all ? results.length : data.total);
	const visible = $derived(results.slice(0, limit));
	const count = new Intl.NumberFormat("en");

	const wallTypes = $derived(decodeWallTypes(data.wallTypes));
	const species = $derived(all ? all.filter((e) => e.isDefault) : null);
	const matches = $derived.by(() => {
		if (!all) return data.wallMatches ? new Set(data.wallMatches) : null;
		return isFiltered(query) ? new Set(results.map((e) => e.speciesId)) : null;
	});

	const colorLabels: Record<WallColor, string> = {
		type: "Type",
		total: "Base stat total",
		...(Object.fromEntries(STAT_KEYS.map((key) => [key, STAT_LABELS[key].long])) as Record<StatKey, string>),
	};

	onMount(() => {
		loadDexList().then((entries) => (all = entries));
	});

	function syncUrl() {
		const params = toSearchParams(query);
		if (view === "grid") params.set("view", "grid");
		if (color !== "type") params.set("color", color);
		const search = params.toString().replaceAll("%2C", ",");
		replaceState(search ? `?${search}` : page.url.pathname, page.state);
	}

	function update(next: Partial<DexQuery>) {
		query = { ...query, ...next };
		limit = PAGE_SIZE;
		syncUrl();
	}

	function setView(next: string) {
		if (next !== "list" && next !== "grid") return;
		view = next;
		syncUrl();
	}

	function setColor(next: string) {
		color = next as WallColor;
		syncUrl();
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
	<h1 class="page-title">Pokédex</h1>
	<p class="mt-2 max-w-prose text-muted-foreground">
		All {count.format(data.speciesCount)} species, one square each, in National Dex order. Search or filter to light them up.
	</p>

	<div class="relative mt-6">
		<SearchIcon class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="search"
			value={query.q}
			oninput={(event) => update({ q: event.currentTarget.value })}
			placeholder="Search by name or number"
			aria-label="Search Pokémon"
			autocomplete="off"
			spellcheck={false}
			class="h-11 rounded-lg bg-card pr-10 pl-11 text-base md:text-base"
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

	<section aria-label="Dex wall" class="mt-4 rounded-lg border bg-card p-4 sm:p-5">
		<div class="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
			<p class="text-muted-foreground tabular" aria-live="polite">
				{#if matches}
					<span class="font-medium text-foreground">{count.format(matches.size)}</span> of {count.format(data.speciesCount)} species match
				{:else}
					Hover a square to preview it, or click to open.
				{/if}
			</p>
			<div class="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
				{#if color !== "type"}
					{@const thresholds = heatThresholds(color)}
					<ol class="flex items-center gap-2 text-xs text-muted-foreground tabular" aria-label="{colorLabels[color]} bands">
						{#each thresholds as low, i (low)}
							<li class="flex items-center gap-1">
								<span class="size-2.5 rounded-[2px]" style:background="var(--stat-{i + 1})"></span>
								{i === thresholds.length - 1 ? `${low}+` : low}
							</li>
						{/each}
					</ol>
				{/if}
				<Select.Root type="single" value={color} onValueChange={setColor}>
					<Select.Trigger size="sm" class="w-48" aria-label="Color squares by">
						Color: {colorLabels[color]}
					</Select.Trigger>
					<Select.Content align="end">
						{#each WALL_COLORS as key (key)}
							<Select.Item value={key} label={colorLabels[key]} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<DexWall types={wallTypes} entries={species} {matches} {color} />
	</section>

	<div class="mt-8 grid gap-4">
		<TypeFilter selected={query.types} onchange={(types) => update({ types })} />
		<FilterControls {query} onchange={update} />
	</div>

	<div class="mt-6 flex h-8 items-center gap-3 text-sm text-muted-foreground">
		<span class="tabular" aria-live="polite">{count.format(total)} {total === 1 ? "result" : "results"}</span>
		{#if isFiltered(query)}
			<Button variant="link" size="sm" class="h-auto px-0" onclick={() => update({ ...DEFAULT_QUERY, sort: query.sort, desc: query.desc })}>
				Clear filters
			</Button>
		{/if}
		<ToggleGroup.Root type="single" variant="outline" size="sm" value={view} onValueChange={setView} aria-label="Layout" class="ml-auto">
			<ToggleGroup.Item value="list" aria-label="List" title="List">
				<ListIcon />
			</ToggleGroup.Item>
			<ToggleGroup.Item value="grid" aria-label="Grid" title="Grid">
				<LayoutGridIcon />
			</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>

	{#if visible.length}
		{#if view === "list"}
			<div class="mt-2">
				<DexTable entries={visible} {query} eager={12} onsort={(sort, desc) => update({ sort, desc })} />
			</div>
		{:else}
			<ul class="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{#each visible as entry, index (entry.id)}
					<li>
						<DexTile {entry} highlight={highlight(entry)} eager={index < 12} />
					</li>
				{/each}
			</ul>
		{/if}
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
