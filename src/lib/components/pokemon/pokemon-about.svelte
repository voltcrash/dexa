<script lang="ts">
	import type { PokemonDetail } from "$lib/pokemon/detail.js";
	import { formatHeight, formatWeight } from "$lib/pokemon/format.js";
	import FlavorText from "./flavor-text.svelte";
	import GenderRatio from "./gender-ratio.svelte";

	let { detail }: { detail: PokemonDetail } = $props();

	const height = $derived(formatHeight(detail.entry.height));
	const weight = $derived(formatWeight(detail.entry.weight));
</script>

<div class="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
	<div class="grid content-start gap-8">
		<FlavorText entries={detail.flavor} />

		<dl class="grid gap-4">
			<dt class="text-sm text-muted-foreground">Abilities</dt>
			{#each detail.abilities as ability (ability.slug)}
				<dd>
					<p class="font-medium">
						<a href="/abilities/{ability.slug}" class="hover:underline hover:underline-offset-4">{ability.name}</a>
						{#if ability.hidden}
							<span class="ml-1 text-xs font-normal text-muted-foreground">Hidden ability</span>
						{/if}
					</p>
					<p class="max-w-prose text-sm text-muted-foreground">{ability.effect}</p>
				</dd>
			{/each}
		</dl>
	</div>

	<dl class="grid content-start divide-y rounded-lg border bg-card text-sm">
		<div class="grid grid-cols-[7rem_1fr] items-baseline gap-4 px-4 py-3">
			<dt class="text-muted-foreground">Height</dt>
			<dd class="tabular"><span class="font-medium">{height.metric}</span> <span class="ml-2 text-muted-foreground">{height.imperial}</span></dd>
		</div>
		<div class="grid grid-cols-[7rem_1fr] items-baseline gap-4 px-4 py-3">
			<dt class="text-muted-foreground">Weight</dt>
			<dd class="tabular"><span class="font-medium">{weight.metric}</span> <span class="ml-2 text-muted-foreground">{weight.imperial}</span></dd>
		</div>
		<div class="grid grid-cols-[7rem_1fr] items-center gap-4 px-4 py-3">
			<dt class="text-muted-foreground">Gender</dt>
			<dd><GenderRatio rate={detail.breeding.genderRate} /></dd>
		</div>
	</dl>
</div>
