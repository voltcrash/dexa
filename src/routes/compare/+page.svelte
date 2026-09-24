<script lang="ts">
	import PlusIcon from "@lucide/svelte/icons/plus";
	import XIcon from "@lucide/svelte/icons/x";
	import { goto } from "$app/navigation";
	import StatComparison from "$lib/components/compare/stat-comparison.svelte";
	import PokemonArt from "$lib/components/pokemon/pokemon-art.svelte";
	import PokemonPicker from "$lib/components/pokemon/pokemon-picker.svelte";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import DefenseTable from "$lib/components/team/defense-table.svelte";
	import type { DexListEntry } from "$lib/dex/list.js";
	import { dexNumber, formatHeight, formatWeight } from "$lib/pokemon/format.js";
	import { teamDefense } from "$lib/team/analysis.js";

	let { data } = $props();

	const MAX = 4;
	let pickerOpen = $state(false);

	const entries = $derived(data.entries);
	const series = $derived(
		entries.map((e, i) => ({ name: e.name, stats: e.stats, color: `var(--series-${i + 1})` })),
	);

	function setSlugs(slugs: string[]) {
		goto(slugs.length ? `?p=${slugs.join(",")}` : "/compare", {
			replaceState: true,
			noScroll: true,
			keepFocus: true,
		});
	}

	function add(entry: DexListEntry) {
		if (entries.some((e) => e.slug === entry.slug)) return;
		setSlugs([...entries.map((e) => e.slug), entry.slug]);
	}
</script>

<svelte:head>
	<title>Compare Pokémon | Dexa</title>
	<meta name="description" content="Compare up to four Pokémon side by side: base stats, type matchups, abilities and size." />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6">
	<h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Compare</h1>
	<p class="mt-3 max-w-prose text-muted-foreground">Put up to four Pokémon side by side.</p>

	<ul class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each entries as entry, i (entry.slug)}
			<li class="relative" style:--tint="var(--type-{entry.types[0]})">
				<a href="/pokemon/{entry.slug}" class="tint-field block rounded-2xl p-[10%]">
					<PokemonArt id={entry.id} name={entry.name} width={256} widths={[256, 384]} sizes="(min-width: 1024px) 280px, 45vw" />
				</a>
				<div class="mt-3 flex items-center gap-2 px-1">
					<span class="h-2.5 w-4 shrink-0 rounded-full" style:background-color="var(--series-{i + 1})" aria-hidden="true"></span>
					<p class="truncate font-medium">{entry.name}</p>
				</div>
				<p class="px-1 text-xs text-muted-foreground tabular">{dexNumber(entry.speciesId)}</p>
				<div class="mt-1.5 flex gap-1 px-1">
					{#each entry.types as type (type)}
						<TypeBadge {type} size="sm" />
					{/each}
				</div>
				<button
					type="button"
					onclick={() => setSlugs(entries.filter((e) => e.slug !== entry.slug).map((e) => e.slug))}
					class="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-background/85 text-muted-foreground backdrop-blur hover:text-foreground"
					aria-label="Remove {entry.name}"
				>
					<XIcon class="size-4" />
				</button>
			</li>
		{/each}
		{#if entries.length < MAX}
			<li>
				<button
					type="button"
					onclick={() => (pickerOpen = true)}
					class="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
				>
					<PlusIcon class="size-6" />
					Add Pokémon
				</button>
			</li>
		{/if}
	</ul>

	{#if entries.length}
		<div class="mt-14 grid gap-14">
			<section aria-labelledby="stats-title">
				<h2 id="stats-title" class="font-display text-2xl font-semibold tracking-tight">Base stats</h2>
				<div class="mt-5">
					<StatComparison {series} />
				</div>
			</section>

			<section aria-labelledby="matchups-title">
				<h2 id="matchups-title" class="font-display text-2xl font-semibold tracking-tight">Type matchups</h2>
				<p class="mt-1 text-sm text-muted-foreground">Damage each Pokémon takes from every attacking type.</p>
				<div class="mt-5">
					<DefenseTable team={entries} rows={teamDefense(entries)} />
				</div>
			</section>

			<section aria-labelledby="profile-title">
				<h2 id="profile-title" class="font-display text-2xl font-semibold tracking-tight">Profile</h2>
				<div class="mt-5 overflow-x-auto rounded-2xl border bg-card">
					<table class="w-full min-w-[36rem] text-sm">
						<thead class="border-b text-left text-xs text-muted-foreground">
							<tr>
								<th scope="col" class="px-4 py-2.5 font-medium"><span class="sr-only">Attribute</span></th>
								{#each entries as entry (entry.slug)}
									<th scope="col" class="px-4 py-2.5 font-medium">{entry.name}</th>
								{/each}
							</tr>
						</thead>
						<tbody class="divide-y align-top">
							<tr>
								<th scope="row" class="px-4 py-3 text-left font-normal text-muted-foreground">Abilities</th>
								{#each entries as entry (entry.slug)}
									<td class="px-4 py-3">
										{#each entry.abilityNames as ability (ability.name)}
											<p>
												{ability.name}
												{#if ability.hidden}<span class="text-xs text-muted-foreground">Hidden</span>{/if}
											</p>
										{/each}
									</td>
								{/each}
							</tr>
							<tr>
								<th scope="row" class="px-4 py-3 text-left font-normal text-muted-foreground">Height</th>
								{#each entries as entry (entry.slug)}
									<td class="px-4 py-3 tabular">{formatHeight(entry.height).metric}</td>
								{/each}
							</tr>
							<tr>
								<th scope="row" class="px-4 py-3 text-left font-normal text-muted-foreground">Weight</th>
								{#each entries as entry (entry.slug)}
									<td class="px-4 py-3 tabular">{formatWeight(entry.weight).metric}</td>
								{/each}
							</tr>
							<tr>
								<th scope="row" class="px-4 py-3 text-left font-normal text-muted-foreground">Generation</th>
								{#each entries as entry (entry.slug)}
									<td class="px-4 py-3 tabular">{entry.generation}</td>
								{/each}
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</div>
	{/if}
</div>

<PokemonPicker bind:open={pickerOpen} title="Add a Pokémon to compare" onpick={add} />
