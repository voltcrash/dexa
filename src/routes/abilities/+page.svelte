<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import { replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import { Input } from "$lib/components/ui/input/index.js";
	import { matchScore } from "$lib/dex/search.js";

	let { data } = $props();

	let q = $state(page.url.searchParams.get("q") ?? "");

	const results = $derived(
		q.trim()
			? data.abilities
					.map((ability) => ({ ability, score: matchScore(q, ability.name) }))
					.filter((r) => r.score !== null)
					.sort((a, b) => (a.score ?? 0) - (b.score ?? 0) || a.ability.name.localeCompare(b.ability.name))
					.map((r) => r.ability)
			: data.abilities,
	);

	function search(value: string) {
		q = value;
		replaceState(value ? `?q=${encodeURIComponent(value)}` : page.url.pathname, page.state);
	}
</script>

<svelte:head>
	<title>Abilities | Dexa</title>
	<meta name="description" content="Every Pokémon ability, what it does, and which Pokémon can have it." />
</svelte:head>

<div class="mx-auto max-w-5xl px-4 pt-10 pb-8 sm:px-6">
	<div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
		<h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Abilities</h1>
		<p class="text-muted-foreground tabular">{data.abilities.length} abilities</p>
	</div>

	<div class="relative mt-8">
		<SearchIcon class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="search"
			value={q}
			oninput={(event) => search(event.currentTarget.value)}
			placeholder="Search abilities"
			aria-label="Search abilities"
			autocomplete="off"
			class="h-12 rounded-xl bg-card pl-11 text-base md:text-base"
		/>
	</div>

	<p class="mt-6 text-sm text-muted-foreground tabular" aria-live="polite">
		{results.length} {results.length === 1 ? "result" : "results"}
	</p>
	<ul class="mt-3 divide-y rounded-xl border bg-card">
		{#each results as ability (ability.slug)}
			<li>
				<a href="/abilities/{ability.slug}" class="flex items-start justify-between gap-6 px-4 py-3 hover:bg-secondary/60">
					<span class="min-w-0">
						<span class="font-medium">{ability.name}</span>
						<span class="mt-0.5 block text-sm text-muted-foreground">{ability.effect}</span>
					</span>
					<span class="shrink-0 text-sm text-muted-foreground tabular">
						{ability.holders} Pokémon
					</span>
				</a>
			</li>
		{:else}
			<li class="px-4 py-10 text-center text-muted-foreground">No abilities match that search.</li>
		{/each}
	</ul>
</div>
