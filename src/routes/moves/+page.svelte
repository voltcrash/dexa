<script lang="ts">
	import ArrowDownWideNarrowIcon from "@lucide/svelte/icons/arrow-down-wide-narrow";
	import ArrowUpNarrowWideIcon from "@lucide/svelte/icons/arrow-up-narrow-wide";
	import SearchIcon from "@lucide/svelte/icons/search";
	import { replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import TypeFilter from "$lib/components/dex/type-filter.svelte";
	import DamageClassIcon from "$lib/components/pokemon/damage-class-icon.svelte";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
	import type { DamageClass } from "$lib/data/types.js";
	import {
		DAMAGE_CLASSES,
		MOVE_SORTS,
		parseMoveQuery,
		queryMoves,
		toMoveSearchParams,
		type MoveQuery,
		type MoveSort,
	} from "$lib/moves/query.js";

	let { data } = $props();

	const PAGE_SIZE = 100;
	let query = $state<MoveQuery>(parseMoveQuery(page.url.searchParams));
	let limit = $state(PAGE_SIZE);

	const results = $derived(queryMoves(data.moves, query));
	const sortLabels: Record<MoveSort, string> = {
		name: "Name",
		power: "Power",
		accuracy: "Accuracy",
		pp: "PP",
		priority: "Priority",
	};
	const classLabels: Record<DamageClass, string> = { physical: "Physical", special: "Special", status: "Status" };

	function update(next: Partial<MoveQuery>) {
		query = { ...query, ...next };
		limit = PAGE_SIZE;
		const search = toMoveSearchParams(query);
		replaceState(search ? `?${search}` : page.url.pathname, page.state);
	}

	function loadMore(node: HTMLElement) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) limit += PAGE_SIZE;
			},
			{ rootMargin: "800px" },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}
</script>

<svelte:head>
	<title>Moves | Dexa</title>
	<meta name="description" content="Every Pokémon move with type, category, power, accuracy, PP and effect." />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6">
	<div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
		<h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Moves</h1>
		<p class="text-muted-foreground tabular">{data.moves.length} moves</p>
	</div>

	<div class="mt-8 grid gap-4">
		<div class="relative">
			<SearchIcon class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				value={query.q}
				oninput={(event) => update({ q: event.currentTarget.value })}
				placeholder="Search moves"
				aria-label="Search moves"
				autocomplete="off"
				class="h-12 rounded-xl bg-card pl-11 text-base md:text-base"
			/>
		</div>
		<TypeFilter selected={query.types} onchange={(types) => update({ types: types.slice(-1) })} />
		<div class="flex flex-wrap items-center gap-2">
			<ToggleGroup.Root
				type="multiple"
				variant="outline"
				size="sm"
				value={query.classes}
				onValueChange={(value) => update({ classes: value as DamageClass[] })}
				aria-label="Filter by category"
			>
				{#each DAMAGE_CLASSES as damageClass (damageClass)}
					<ToggleGroup.Item value={damageClass}>{classLabels[damageClass]}</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>
			<div class="ml-auto flex items-center gap-2">
				<Select.Root type="single" value={query.sort} onValueChange={(sort) => update({ sort: sort as MoveSort })}>
					<Select.Trigger size="sm" class="w-40" aria-label="Sort by">Sort: {sortLabels[query.sort]}</Select.Trigger>
					<Select.Content align="end">
						{#each MOVE_SORTS as key (key)}
							<Select.Item value={key} label={sortLabels[key]} />
						{/each}
					</Select.Content>
				</Select.Root>
				<Button
					variant="outline"
					size="icon-sm"
					onclick={() => update({ desc: !query.desc })}
					aria-label={query.desc ? "Sort ascending" : "Sort descending"}
				>
					{#if query.desc}<ArrowDownWideNarrowIcon />{:else}<ArrowUpNarrowWideIcon />{/if}
				</Button>
			</div>
		</div>
	</div>

	<p class="mt-6 text-sm text-muted-foreground tabular" aria-live="polite">
		{results.length} {results.length === 1 ? "result" : "results"}
	</p>

	<div class="mt-3 overflow-x-auto rounded-xl border bg-card">
		<table class="w-full min-w-[44rem] text-sm">
			<thead class="border-b text-left text-xs text-muted-foreground">
				<tr>
					<th scope="col" class="px-4 py-2.5 font-medium">Move</th>
					<th scope="col" class="px-2 py-2.5 font-medium">Type</th>
					<th scope="col" class="px-2 py-2.5 font-medium">Category</th>
					<th scope="col" class="px-2 py-2.5 text-right font-medium">Power</th>
					<th scope="col" class="px-2 py-2.5 text-right font-medium">Acc.</th>
					<th scope="col" class="px-2 py-2.5 text-right font-medium">PP</th>
					<th scope="col" class="px-4 py-2.5 text-right font-medium">Gen.</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each results.slice(0, limit) as move (move.slug)}
					<tr class="align-top">
						<td class="px-4 py-2.5">
							<a href="/moves/{move.slug}" class="font-medium hover:underline hover:underline-offset-4">{move.name}</a>
							{#if move.priority !== 0}
								<span class="ml-1 text-xs text-muted-foreground">Priority {move.priority > 0 ? "+" : ""}{move.priority}</span>
							{/if}
							<p class="mt-0.5 line-clamp-2 max-w-lg text-xs text-muted-foreground">{move.effect}</p>
						</td>
						<td class="px-2 py-2.5"><TypeBadge type={move.type} size="sm" /></td>
						<td class="px-2 py-2.5"><DamageClassIcon value={move.damageClass} /></td>
						<td class="px-2 py-2.5 text-right tabular">{move.power ?? "—"}</td>
						<td class="px-2 py-2.5 text-right tabular">{move.accuracy === null ? "—" : `${move.accuracy}%`}</td>
						<td class="px-2 py-2.5 text-right tabular">{move.pp ?? "—"}</td>
						<td class="px-4 py-2.5 text-right text-muted-foreground tabular">{move.generation}</td>
					</tr>
				{:else}
					<tr><td colspan="7" class="px-4 py-10 text-center text-muted-foreground">No moves match. Try another name or clear a filter.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
	{#if limit < results.length}
		<div {@attach loadMore} class="h-px" aria-hidden="true"></div>
	{/if}
</div>
