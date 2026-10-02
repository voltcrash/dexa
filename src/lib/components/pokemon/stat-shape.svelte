<script lang="ts">
	import { ringPoints, shapePoints, toPath } from "#lib/pokemon/shape.js";
	import { STAT_KEYS, STAT_LABELS, type BaseStats } from "#lib/pokemon/types.js";
	import { cn } from "#lib/utils.js";

	let {
		stats,
		color = "var(--tint)",
		rings = false,
		label,
		class: className,
	}: {
		stats: BaseStats;
		color?: string;
		/** Draw guide rings and spokes, for larger renderings. */
		rings?: boolean;
		/** Accessible name; the shape is decorative when omitted. */
		label?: string;
		class?: string;
	} = $props();

	const R = 50;
	const shape = $derived(toPath(shapePoints(stats, R - 2, R)));
	const rim = toPath(ringPoints(1, R - 2, R));
	const guides = [0.35, 0.68].map((f) => toPath(ringPoints(f, R - 2, R)));
	const spokes = ringPoints(1, R - 2, R);
	const description = $derived(
		label ?? STAT_KEYS.map((key, i) => `${STAT_LABELS[key].long} ${stats[i]}`).join(", "),
	);
</script>

<svg
	viewBox="0 0 100 100"
	class={cn("size-8 shrink-0 overflow-visible", className)}
	role={label ? "img" : undefined}
	aria-label={label ? description : undefined}
	aria-hidden={label ? undefined : "true"}
	style:--shape={color}
>
	<polygon points={rim} class="fill-muted stroke-border" stroke-width={rings ? 1 : 3} vector-effect={rings ? "non-scaling-stroke" : undefined} />
	{#if rings}
		{#each guides as guide (guide)}
			<polygon points={guide} fill="none" class="stroke-border" stroke-width="1" vector-effect="non-scaling-stroke" />
		{/each}
		{#each spokes as spoke, i (i)}
			<line x1={R} y1={R} x2={spoke.x} y2={spoke.y} class="stroke-border" stroke-width="1" vector-effect="non-scaling-stroke" />
		{/each}
	{/if}
	<polygon
		points={shape}
		fill="color-mix(in oklab, var(--shape) 55%, transparent)"
		stroke="var(--shape)"
		stroke-width={rings ? 2 : 4}
		stroke-linejoin="round"
		vector-effect={rings ? "non-scaling-stroke" : undefined}
	/>
</svg>
