<script lang="ts">
	import { goto } from "$app/navigation";
	import PokemonArt from "$lib/components/pokemon/pokemon-art.svelte";
	import StatShape from "$lib/components/pokemon/stat-shape.svelte";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import { statTotal, type DexListEntry } from "$lib/dex/list.js";
	import { heatBand, type WallColor } from "$lib/dex/wall.js";
	import { dexNumber, titleCase } from "$lib/pokemon/format.js";
	import { GENERATIONS } from "$lib/pokemon/generations.js";
	import { STAT_KEYS, STAT_LABELS, type TypeName } from "$lib/pokemon/types.js";
	import { cn } from "$lib/utils.js";

	let {
		types,
		entries,
		matches,
		color,
	}: {
		/** Types of every species in dex order; enough to paint the wall before entries load. */
		types: TypeName[][];
		/** Default forms in dex order, once the full index has loaded. */
		entries: DexListEntry[] | null;
		/** Species numbers lit by the current search and filters; null lights everything. */
		matches: Set<number> | null;
		color: WallColor;
	} = $props();

	let active = $state<number | null>(null);
	let card = $state<{ left: number; top: number; above: boolean } | null>(null);
	let root = $state<HTMLDivElement>();
	let listbox = $state<HTMLDivElement>();
	let pointer = "mouse";

	const count = new Intl.NumberFormat("en");
	const current = $derived(active !== null ? entries?.[active] : undefined);

	function fill(index: number): string {
		const entry = entries?.[index];
		if (color !== "type") return entry ? `var(--stat-${heatBand(entry, color)})` : "var(--muted)";
		const [a, b] = entry?.types ?? types[index] ?? [];
		if (!a) return "var(--muted)";
		return b ? `linear-gradient(135deg, var(--type-${a}) 50%, var(--type-${b}) 50%)` : `var(--type-${a})`;
	}

	function label(index: number): string {
		const entry = entries?.[index];
		if (!entry) return dexNumber(index + 1);
		return `${entry.name}, ${dexNumber(entry.speciesId)}, ${entry.types.map(titleCase).join(" and ")}`;
	}

	const lit = (index: number) => !matches || matches.has(index + 1);

	function matchCount(start: number, end: number): number {
		if (!matches) return end - start;
		let n = 0;
		for (let i = start; i < end; i++) if (matches.has(i + 1)) n++;
		return n;
	}

	function cells(): HTMLElement[] {
		return listbox ? [...listbox.querySelectorAll<HTMLElement>("[data-index]")] : [];
	}

	// Place the preview card above the active cell, or below it near the top of the wall.
	$effect(() => {
		if (active === null || !root) {
			card = null;
			return;
		}
		const cell = cells()[active];
		if (!cell) return;
		const box = root.getBoundingClientRect();
		const rect = cell.getBoundingClientRect();
		const width = Math.min(256, box.width);
		const centre = rect.left - box.left + rect.width / 2;
		const above = rect.top - box.top > 170;
		card = {
			left: Math.max(0, Math.min(box.width - width, centre - width / 2)),
			top: above ? rect.top - box.top - 10 : rect.bottom - box.top + 10,
			above,
		};
	});

	function indexOf(event: Event): number | null {
		const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-index]");
		return cell ? Number(cell.dataset.index) : null;
	}

	function open(index: number) {
		const entry = entries?.[index];
		if (entry) goto(`/pokemon/${entry.slug}`);
	}

	function onclick(event: MouseEvent) {
		const index = indexOf(event);
		if (index === null) return;
		// Touch has no hover, so the first tap previews and a second tap opens.
		if (pointer !== "mouse" && active !== index) active = index;
		else open(index);
	}

	function step(from: number, direction: 1 | -1): number {
		const last = types.length - 1;
		for (let i = from + direction; i >= 0 && i <= last; i += direction) if (lit(i)) return i;
		return from;
	}

	// Rows wrap differently at every width, so find the nearest cell on the next row by position.
	function vertical(from: number, direction: 1 | -1): number {
		const all = cells();
		const origin = all[from]?.getBoundingClientRect();
		if (!origin) return from;
		const x = origin.left + origin.width / 2;
		let row: number | null = null;
		let best = from;
		let distance = Infinity;
		for (let i = from + direction; i >= 0 && i < all.length; i += direction) {
			const rect = all[i].getBoundingClientRect();
			if (Math.abs(rect.top - origin.top) < 2) continue;
			row ??= rect.top;
			if (Math.abs(rect.top - row) >= 2) break;
			const d = Math.abs(rect.left + rect.width / 2 - x);
			if (d < distance) [best, distance] = [i, d];
		}
		return best;
	}

	function onkeydown(event: KeyboardEvent) {
		const from = active ?? -1;
		let next: number;
		switch (event.key) {
			case "ArrowRight":
				next = step(from, 1);
				break;
			case "ArrowLeft":
				next = step(Math.max(from, 0), -1);
				break;
			case "ArrowDown":
				next = vertical(Math.max(from, 0), 1);
				break;
			case "ArrowUp":
				next = vertical(Math.max(from, 0), -1);
				break;
			case "Home":
				next = step(-1, 1);
				break;
			case "End":
				next = step(types.length, -1);
				break;
			case "Enter":
			case " ":
				event.preventDefault();
				if (active !== null) open(active);
				return;
			case "Escape":
				active = null;
				return;
			default:
				return;
		}
		event.preventDefault();
		active = next;
		cells()[next]?.scrollIntoView({ block: "nearest" });
	}
</script>

<div bind:this={root} class="relative">
	<div
		bind:this={listbox}
		role="listbox"
		tabindex="0"
		aria-label="Every Pokémon species in National Dex order"
		aria-activedescendant={active !== null ? `wall-${active + 1}` : undefined}
		class="grid gap-2.5 rounded-lg outline-offset-4 sm:gap-2"
		onfocus={() => (active ??= step(-1, 1))}
		onblur={() => (active = null)}
		onpointerdown={(event) => (pointer = event.pointerType)}
		onpointerover={(event) => {
			if (event.pointerType === "mouse") active = indexOf(event) ?? active;
		}}
		onpointerleave={(event) => {
			if (event.pointerType === "mouse" && document.activeElement !== listbox) active = null;
		}}
		{onclick}
		{onkeydown}
	>
		{#each GENERATIONS as gen (gen.id)}
			{@const start = gen.range[0] - 1}
			{@const end = Math.min(gen.range[1], types.length)}
			<div role="group" aria-label="Generation {gen.numeral}, {gen.region}" class="grid gap-x-4 gap-y-1 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
				<div aria-hidden="true" class="flex items-baseline gap-2 text-xs sm:flex-col sm:gap-0 sm:pt-px">
					<span class="font-display font-semibold text-foreground">{gen.numeral} <span class="font-sans font-normal text-muted-foreground">{gen.region}</span></span>
					<span class="text-muted-foreground tabular">
						{matches ? `${count.format(matchCount(start, end))} of ${count.format(end - start)}` : count.format(end - start)}
					</span>
				</div>
				<div class="cells">
					{#each { length: end - start } as _, offset (offset)}
						{@const i = start + offset}
						<span
							id="wall-{i + 1}"
							role="option"
							aria-selected={active === i}
							aria-label={label(i)}
							data-index={i}
							class={cn("cell", !lit(i) && "dim", active === i && "active")}
							style:background={fill(i)}
						></span>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#if current && card}
		{@const total = statTotal(current)}
		<div
			class="pointer-events-none absolute z-20 w-64 max-w-full rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg"
			style:left="{card.left}px"
			style:top="{card.top}px"
			style:translate={card.above ? "0 -100%" : undefined}
			style:--tint="var(--type-{current.types[0]})"
			aria-hidden="true"
		>
			<div class="flex items-center gap-3">
				<span class="tint-field grid size-16 shrink-0 place-items-center rounded-md p-1">
					{#key current.id}
						<PokemonArt id={current.id} name="" width={96} widths={[96, 192]} sizes="64px" eager />
					{/key}
				</span>
				<div class="min-w-0">
					<p class="text-xs text-muted-foreground tabular font-condensed">{dexNumber(current.speciesId)}</p>
					<p class="truncate leading-tight font-semibold">{current.name}</p>
					<div class="mt-1.5 flex gap-1">
						{#each current.types as type (type)}
							<TypeBadge {type} size="sm" />
						{/each}
					</div>
				</div>
			</div>
			<div class="mt-3 flex items-center gap-3 border-t pt-3">
				<StatShape stats={current.stats} class="size-12" />
				<dl class="grid flex-1 grid-cols-3 gap-x-2 gap-y-0.5 text-xs">
					{#each STAT_KEYS as key, i (key)}
						<div class={cn("flex justify-between gap-1", color === key && "font-semibold")}>
							<dt class="text-muted-foreground">{STAT_LABELS[key].short}</dt>
							<dd class="tabular">{current.stats[i]}</dd>
						</div>
					{/each}
				</dl>
			</div>
			<p class={cn("mt-2 flex justify-between text-xs", color === "total" && "font-semibold")}>
				<span class="text-muted-foreground">Base stat total</span>
				<span class="tabular">{total}</span>
			</p>
		</div>
	{/if}
</div>

<style>
	.cells {
		--cell: 0.5rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(var(--cell), 1fr));
		gap: 2px;
	}

	@media (width >= 40rem) {
		.cells {
			--cell: 0.75rem;
		}
	}

	@media (width >= 64rem) {
		.cells {
			--cell: 0.875rem;
		}
	}

	.cell {
		aspect-ratio: 1;
		border-radius: 2px;
		cursor: pointer;
		transition:
			opacity 200ms,
			scale 120ms;
	}

	.cell.dim {
		opacity: 0.12;
	}

	.cell.active {
		position: relative;
		z-index: 1;
		scale: 1.7;
		opacity: 1;
		box-shadow:
			0 0 0 1.5px var(--background),
			0 0 0 2.5px var(--foreground);
	}
</style>
