<script lang="ts">
	import type { Snippet } from "svelte";
	import { SHAPE_ORDER, ringPoints } from "$lib/pokemon/shape.js";
	import { STAT_KEYS, STAT_LABELS, type BaseStats } from "$lib/pokemon/types.js";
	import StatShape from "./stat-shape.svelte";

	let { stats, children }: { stats: BaseStats; children: Snippet } = $props();

	// The shape fills the middle 82% of the box; labels sit just outside its rim.
	const labels = ringPoints(0.47, 1, 0.5);
</script>

<div class="relative aspect-square">
	<StatShape {stats} rings class="absolute inset-[9%] size-[82%]" />
	<div class="absolute inset-[23%]">
		{@render children()}
	</div>
	{#each SHAPE_ORDER as stat, i (stat)}
		<span
			class="absolute -translate-x-1/2 -translate-y-1/2 text-center leading-tight"
			style:left="{labels[i].x * 100}%"
			style:top="{labels[i].y * 100}%"
		>
			<span class="block text-xs text-muted-foreground">{STAT_LABELS[STAT_KEYS[stat]].short}</span>
			<span class="block font-display text-base font-semibold sm:text-lg">{stats[stat]}</span>
		</span>
	{/each}
</div>
