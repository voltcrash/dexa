<script lang="ts">
	import { replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import TypeFilter from "$lib/components/dex/type-filter.svelte";
	import TypeChart from "$lib/components/types/type-chart.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { defensiveProfile, formatMultiplier, groupProfile } from "$lib/pokemon/matchups.js";
	import { isTypeName, type TypeName } from "$lib/pokemon/types.js";

	let defenders = $derived<TypeName[]>(
		(page.url.searchParams.get("def") ?? "").split(",").filter(isTypeName).slice(0, 2),
	);

	const groups = $derived(defenders.length ? groupProfile(defensiveProfile(defenders)) : []);

	function setDefenders(next: TypeName[]) {
		defenders = next;
		replaceState(next.length ? `?def=${next.join(",")}` : page.url.pathname, page.state);
	}

	function pick(type: TypeName) {
		setDefenders(defenders.includes(type) ? defenders.filter((t) => t !== type) : [...defenders, type].slice(-2));
	}

	const label = (m: number) =>
		m === 0 ? "No effect" : m > 1 ? `Weak ${formatMultiplier(m)}` : `Resists ${formatMultiplier(m)}`;
</script>

<svelte:head>
	<title>Type chart | Dexa</title>
	<meta name="description" content="Every type matchup in one chart, plus a calculator for dual-type weaknesses and resistances." />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6">
	<h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Type chart</h1>
	<p class="mt-3 max-w-prose text-muted-foreground">
		Rows attack, columns defend. Pick one or two defending types to see how every attack lands against that combination.
	</p>

	<section aria-labelledby="calculator-title" class="mt-10 rounded-2xl border bg-card p-5 sm:p-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h2 id="calculator-title" class="font-display text-xl font-semibold">Defense calculator</h2>
			{#if defenders.length}
				<Button variant="ghost" size="sm" onclick={() => setDefenders([])}>Clear</Button>
			{/if}
		</div>
		<div class="mt-4">
			<TypeFilter selected={defenders} onchange={setDefenders} />
		</div>
		{#if defenders.length}
			<div class="mt-6 flex flex-wrap items-center gap-2">
				<span class="text-sm text-muted-foreground">A</span>
				{#each defenders as type (type)}
					<TypeBadge {type} />
				{/each}
				<span class="text-sm text-muted-foreground">Pokémon takes:</span>
			</div>
			<dl class="mt-3 divide-y">
				{#each groups as group (group.multiplier)}
					<div class="grid gap-2 py-3 sm:grid-cols-[9rem_1fr] sm:items-center">
						<dt class="text-sm {group.multiplier > 1 ? 'font-medium' : 'text-muted-foreground'}">{label(group.multiplier)}</dt>
						<dd class="flex flex-wrap gap-1.5">
							{#each group.types as type (type)}
								<TypeBadge {type} />
							{/each}
						</dd>
					</div>
				{/each}
			</dl>
			<a href="/?type={defenders.join(',')}" class="mt-4 inline-block text-sm underline underline-offset-4 hover:text-primary">
				Browse Pokémon with this typing
			</a>
		{:else}
			<p class="mt-4 text-sm text-muted-foreground">Choose a type above, or a column heading in the chart.</p>
		{/if}
	</section>

	<section aria-label="Type chart" class="mt-10">
		<TypeChart highlightDefenders={defenders} onpick={pick} />
		<div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
			<span class="flex items-center gap-2"><span class="size-4 rounded bg-[#2f9e5b]"></span>Super effective (2×)</span>
			<span class="flex items-center gap-2"><span class="size-4 rounded bg-[#f3d4cf] dark:bg-[#4b2320]"></span>Not very effective (½×)</span>
			<span class="flex items-center gap-2"><span class="size-4 rounded bg-foreground"></span>No effect (0×)</span>
		</div>
	</section>
</div>
