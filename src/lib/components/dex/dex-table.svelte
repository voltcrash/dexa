<script lang="ts">
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import PokemonArt from "#lib/components/pokemon/pokemon-art.svelte";
	import StatShape from "#lib/components/pokemon/stat-shape.svelte";
	import TypeBadge from "#lib/components/pokemon/type-badge.svelte";
	import { statTotal, type DexListEntry, type DexQuery, type SortKey } from "#lib/dex/list.js";
	import { dexNumber } from "#lib/pokemon/format.js";
	import { STAT_KEYS, STAT_LABELS, type StatKey } from "#lib/pokemon/types.js";
	import { cn } from "#lib/utils.js";

	let {
		entries,
		query,
		onsort,
		eager = 0,
	}: {
		entries: DexListEntry[];
		query: DexQuery;
		onsort: (sort: SortKey, desc: boolean) => void;
		eager?: number;
	} = $props();

	// Narrow screens only have room for one figure, so show whichever stat is being sorted on.
	const compactKey = $derived<StatKey | "total">(
		(STAT_KEYS as readonly string[]).includes(query.sort) ? (query.sort as StatKey) : "total",
	);
	const compactLabel = $derived(compactKey === "total" ? "Total" : STAT_LABELS[compactKey].short);

	function figure(entry: DexListEntry, key: StatKey | "total"): number {
		return key === "total" ? statTotal(entry) : entry.stats[STAT_KEYS.indexOf(key)];
	}

	function sortBy(key: SortKey) {
		// Figures read best largest first; dex number and name read best ascending.
		const numeric = key !== "dex" && key !== "name";
		onsort(key, query.sort === key ? !query.desc : numeric);
	}

	function ariaSort(key: SortKey) {
		if (query.sort !== key) return undefined;
		return query.desc ? "descending" : "ascending";
	}
</script>

{#snippet header(key: SortKey, label: string, title: string, className: string)}
	<th scope="col" aria-sort={ariaSort(key)} class={cn("p-0 font-medium", className)}>
		<button
			type="button"
			{title}
			onclick={() => sortBy(key)}
			class={cn(
				"inline-flex h-9 w-full items-center gap-1 px-2 hover:text-foreground",
				key === "dex" || key === "name" ? "justify-start" : "justify-end",
				query.sort === key && "text-foreground",
			)}
		>
			{label}
			{#if query.sort === key}
				{#if query.desc}
					<ArrowDownIcon class="size-3" aria-hidden="true" />
				{:else}
					<ArrowUpIcon class="size-3" aria-hidden="true" />
				{/if}
			{/if}
		</button>
	</th>
{/snippet}

<div class="overflow-clip rounded-lg border bg-card">
	<table class="w-full text-sm">
		<thead class="border-b bg-muted text-xs text-muted-foreground lg:sticky lg:top-14 lg:z-10">
			<tr>
				{@render header("dex", "No.", "Sort by dex number", "hidden w-20 pl-2 sm:table-cell")}
				{@render header("name", "Pokémon", "Sort by name", "pl-2 text-left sm:pl-0")}
				<th scope="col" class="hidden w-40 px-2 text-left font-medium md:table-cell">Type</th>
				<th scope="col" class="hidden w-14 px-2 text-left font-medium md:table-cell">Shape</th>
				{#each STAT_KEYS as key (key)}
					{@render header(key, STAT_LABELS[key].short, `Sort by ${STAT_LABELS[key].long}`, "hidden w-14 lg:table-cell")}
				{/each}
				{@render header("total", "Total", "Sort by base stat total", "hidden w-16 pr-2 lg:table-cell")}
				{@render header(compactKey, compactLabel, "Sort by this figure", "w-16 pr-2 lg:hidden")}
			</tr>
		</thead>
		<tbody class="divide-y">
			{#each entries as entry, index (entry.id)}
				<tr class="relative transition-colors hover:bg-muted/60" style:--tint="var(--type-{entry.types[0]})">
					<td class="hidden py-1.5 pl-4 text-muted-foreground tabular font-condensed sm:table-cell">
						{dexNumber(entry.speciesId)}
					</td>
					<td class="py-1.5 pr-2 pl-4 sm:pl-2">
						<div class="flex items-center gap-3">
							<span class="tint-field grid size-11 shrink-0 place-items-center rounded-md p-0.5">
								<PokemonArt
									id={entry.id}
									name=""
									width={96}
									widths={[96, 192]}
									sizes="44px"
									eager={index < eager}
								/>
							</span>
							<div class="min-w-0">
								<p class="text-xs text-muted-foreground tabular font-condensed sm:hidden">{dexNumber(entry.speciesId)}</p>
								<a
									href="/pokemon/{entry.slug}"
									class="font-medium after:absolute after:inset-0 hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
									data-sveltekit-preload-data="hover"
								>
									{entry.name}
								</a>
								<div class="mt-1 flex gap-1 md:hidden">
									{#each entry.types as type (type)}
										<TypeBadge {type} size="sm" />
									{/each}
								</div>
							</div>
						</div>
					</td>
					<td class="hidden px-2 md:table-cell">
						<div class="flex gap-1">
							{#each entry.types as type (type)}
								<TypeBadge {type} size="sm" />
							{/each}
						</div>
					</td>
					<td class="hidden px-2 md:table-cell">
						<StatShape stats={entry.stats} class="size-9" />
					</td>
					{#each STAT_KEYS as key, i (key)}
						<td class={cn("hidden px-2 text-right tabular lg:table-cell", query.sort === key ? "font-semibold" : "text-muted-foreground")}>
							{entry.stats[i]}
						</td>
					{/each}
					<td class="hidden pr-4 pl-2 text-right font-semibold tabular lg:table-cell">{statTotal(entry)}</td>
					<td class="pr-4 pl-2 text-right font-semibold tabular lg:hidden">{figure(entry, compactKey)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
