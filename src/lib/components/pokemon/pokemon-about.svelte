<script lang="ts">
	import type { PokemonDetail } from "$lib/pokemon/detail.js";
	import FlavorText from "./flavor-text.svelte";
	import GenderRatio from "./gender-ratio.svelte";
	import SizeComparison from "./size-comparison.svelte";

	let { detail }: { detail: PokemonDetail } = $props();
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

	<div class="grid content-start gap-4">
		{#key detail.entry.id}
			<SizeComparison id={detail.entry.id} name={detail.entry.name} height={detail.entry.height} weight={detail.entry.weight} />
		{/key}
		<dl class="rounded-lg border bg-card text-sm">
			<div class="grid grid-cols-[7rem_1fr] items-center gap-4 px-4 py-3">
				<dt class="text-muted-foreground">Gender</dt>
				<dd><GenderRatio rate={detail.breeding.genderRate} /></dd>
			</div>
		</dl>
	</div>
</div>
