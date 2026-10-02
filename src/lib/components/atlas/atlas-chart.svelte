<script lang="ts">
	import PokemonPeek from "#lib/components/pokemon/pokemon-peek.svelte";
	import { AXIS_LABELS, axisValue, isLog, makeScale, type Axis } from "#lib/dex/atlas.js";
	import type { DexListEntry } from "#lib/dex/list.js";
	import { STAT_KEYS } from "#lib/pokemon/types.js";

	let {
		entries,
		x,
		y,
		matches,
		onopen,
	}: {
		entries: DexListEntry[];
		x: Axis;
		y: Axis;
		/** Ids lit by the search; null lights everything. */
		matches: Set<number> | null;
		onopen: (entry: DexListEntry) => void;
	} = $props();

	const M = { top: 12, right: 16, bottom: 48, left: 56 };
	const HIT = 24;

	let width = $state(0);
	let active = $state<number | null>(null);
	let pointer = "mouse";
	// Touch has no hover: the first tap previews a point and a second tap on it opens it.
	let armed = false;

	const height = $derived(Math.round(Math.min(620, Math.max(340, width * 0.62))));
	const plotW = $derived(Math.max(0, width - M.left - M.right));
	const plotH = $derived(height - M.top - M.bottom);

	const xScale = $derived(makeScale(entries.map((e) => axisValue(e, x)), x));
	const yScale = $derived(makeScale(entries.map((e) => axisValue(e, y)), y));
	const bothStats = $derived(
		(STAT_KEYS as readonly string[]).includes(x) && (STAT_KEYS as readonly string[]).includes(y),
	);

	// Base stats are whole numbers, so many Pokémon share a spot; a fixed nudge per id separates them.
	const nudge = (id: number, salt: number) => (((id * salt) % 7) - 3) * 0.45;

	const points = $derived(
		entries.map((entry) => ({
			entry,
			px: M.left + xScale.at(axisValue(entry, x)) * plotW + nudge(entry.id, 37),
			py: M.top + (1 - yScale.at(axisValue(entry, y))) * plotH + nudge(entry.id, 53),
			lit: !matches || matches.has(entry.id),
		})),
	);
	const dim = $derived(points.filter((p) => !p.lit));
	const lit = $derived(points.filter((p) => p.lit));
	const current = $derived(active !== null ? lit[active] : undefined);

	// Keyboard order runs left to right, so arrow keys sweep across the chart.
	const order = $derived(
		lit.map((_, i) => i).sort((a, b) => lit[a].px - lit[b].px || lit[b].py - lit[a].py),
	);

	function format(value: number, axis: Axis) {
		return isLog(axis) ? String(value) : value.toLocaleString("en");
	}

	function nearest(event: PointerEvent): number | null {
		const box = (event.currentTarget as SVGElement).getBoundingClientRect();
		const mx = event.clientX - box.left;
		const my = event.clientY - box.top;
		let best: number | null = null;
		let distance = HIT * HIT;
		lit.forEach((p, i) => {
			const d = (p.px - mx) ** 2 + (p.py - my) ** 2;
			if (d < distance) [best, distance] = [i, d];
		});
		return best;
	}

	function onkeydown(event: KeyboardEvent) {
		if (!lit.length) return;
		const position = active === null ? -1 : order.indexOf(active);
		if (event.key === "ArrowRight" || event.key === "ArrowUp") {
			active = order[Math.min(order.length - 1, position + 1)];
		} else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
			active = order[Math.max(0, position - 1)];
		} else if (event.key === "Enter" && current) {
			onopen(current.entry);
		} else if (event.key === "Escape") {
			active = null;
			return;
		} else return;
		event.preventDefault();
	}

	const peekLeft = $derived(current && current.px > width - 290 ? current.px - 272 : (current?.px ?? 0) + 16);
	const peekTop = $derived(current ? Math.min(Math.max(0, current.py - 100), height - 210) : 0);
</script>

<div class="relative" bind:clientWidth={width}>
	{#if width}
		<svg
			{width}
			{height}
			role="listbox"
			aria-roledescription="scatter plot"
			aria-label="{AXIS_LABELS[y]} against {AXIS_LABELS[x]}. Use the arrow keys to move between Pokémon and Enter to open one."
			aria-activedescendant={current ? `atlas-${current.entry.id}` : undefined}
			tabindex="0"
			class="block touch-pan-y rounded-md outline-offset-2 select-none"
			onpointerdown={(event) => {
				pointer = event.pointerType;
				if (pointer === "mouse") return;
				const hit = nearest(event);
				armed = hit !== null && hit === active;
				active = hit;
			}}
			onpointermove={(event) => {
				if (event.pointerType === "mouse") active = nearest(event);
			}}
			onpointerleave={(event) => {
				if (event.pointerType === "mouse") active = null;
			}}
			onclick={() => {
				if (current && (pointer === "mouse" || armed)) onopen(current.entry);
			}}
			{onkeydown}
		>
			<g class="text-[11px]" aria-hidden="true">
				{#each xScale.ticks as tick (tick)}
					{@const tx = M.left + xScale.at(tick) * plotW}
					<line x1={tx} x2={tx} y1={M.top} y2={M.top + plotH} class="stroke-border" />
					<text x={tx} y={M.top + plotH + 18} text-anchor="middle" class="fill-muted-foreground tabular">{format(tick, x)}</text>
				{/each}
				{#each yScale.ticks as tick (tick)}
					{@const ty = M.top + (1 - yScale.at(tick)) * plotH}
					<line x1={M.left} x2={M.left + plotW} y1={ty} y2={ty} class="stroke-border" />
					<text x={M.left - 8} y={ty + 4} text-anchor="end" class="fill-muted-foreground tabular">{format(tick, y)}</text>
				{/each}
				<text x={M.left + plotW / 2} y={height - 6} text-anchor="middle" class="fill-foreground text-xs font-medium">{AXIS_LABELS[x]}</text>
				<text transform="translate(14 {M.top + plotH / 2}) rotate(-90)" text-anchor="middle" class="fill-foreground text-xs font-medium">{AXIS_LABELS[y]}</text>
				{#if bothStats}
					{@const d = Math.min(xScale.domain[1], yScale.domain[1])}
					{@const ex = M.left + xScale.at(d) * plotW}
					{@const ey = M.top + (1 - yScale.at(d)) * plotH}
					<line x1={M.left} y1={M.top + plotH} x2={ex} y2={ey} class="stroke-muted-foreground/50" />
					<text x={ex - 4} y={ey + 14} text-anchor="end" class="fill-muted-foreground">Equal</text>
				{/if}
			</g>

			<g>
				{#each dim as p (p.entry.id)}
					<circle class="point" style:cx="{p.px}px" style:cy="{p.py}px" r="2.5" fill="var(--muted-foreground)" opacity="0.18" aria-hidden="true" />
				{/each}
				{#each lit as p (p.entry.id)}
					<circle
						id="atlas-{p.entry.id}"
						role="option"
						aria-selected={current?.entry.id === p.entry.id}
						aria-label="{p.entry.name}, {AXIS_LABELS[x]} {axisValue(p.entry, x)}, {AXIS_LABELS[y]} {axisValue(p.entry, y)}"
						class="point stroke-card"
						style:cx="{p.px}px"
						style:cy="{p.py}px"
						r={matches ? 4 : 3.5}
						stroke-width="1"
						fill="var(--type-{p.entry.types[0]})"
					/>
				{/each}
				{#if current}
					<circle aria-hidden="true" cx={current.px} cy={current.py} r="7" fill="none" class="stroke-card" stroke-width="4" />
					<circle aria-hidden="true" cx={current.px} cy={current.py} r="7" fill="none" class="stroke-foreground" stroke-width="2" />
				{/if}
			</g>
		</svg>

		{#if current}
			<div
				class="pointer-events-none absolute z-10 w-64 rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg"
				style:left="{Math.max(0, peekLeft)}px"
				style:top="{peekTop}px"
				aria-live="polite"
			>
				<PokemonPeek
					entry={current.entry}
					emphasis={[x, y]}
					notes={[x, y]
						.filter((axis) => isLog(axis as Axis))
						.map((axis) => ({
							label: axis === "height" ? "Height" : "Weight",
							value: `${axisValue(current.entry, axis as Axis)} ${axis === "height" ? "m" : "kg"}`,
						}))}
				/>
			</div>
		{/if}
	{:else}
		<div class="h-[340px]"></div>
	{/if}
</div>

<style>
	.point {
		transition:
			cx 500ms cubic-bezier(0.2, 0.8, 0.2, 1),
			cy 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
</style>
