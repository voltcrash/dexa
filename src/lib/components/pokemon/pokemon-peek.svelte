<script lang="ts">
	import { statTotal, type DexListEntry } from "#lib/dex/list.js";
	import { dexNumber } from "#lib/pokemon/format.js";
	import { STAT_KEYS, STAT_LABELS } from "#lib/pokemon/types.js";
	import { cn } from "#lib/utils.js";
	import PokemonArt from "./pokemon-art.svelte";
	import StatShape from "./stat-shape.svelte";
	import TypeBadge from "./type-badge.svelte";

	let {
		entry,
		emphasis = [],
		notes = [],
	}: {
		entry: DexListEntry;
		/** Stat keys, or "total", to set in bold. */
		emphasis?: string[];
		/** Extra figures to list under the stats, such as height. */
		notes?: { label: string; value: string }[];
	} = $props();
</script>

<div style:--tint="var(--type-{entry.types[0]})">
	<div class="flex items-center gap-3">
		<span class="tint-field grid size-16 shrink-0 place-items-center rounded-md p-1">
			{#key entry.id}
				<PokemonArt id={entry.id} name="" width={96} widths={[96, 192]} sizes="64px" eager />
			{/key}
		</span>
		<div class="min-w-0">
			<p class="text-xs text-muted-foreground tabular font-condensed">{dexNumber(entry.speciesId)}</p>
			<p class="truncate leading-tight font-semibold">{entry.name}</p>
			<div class="mt-1.5 flex gap-1">
				{#each entry.types as type (type)}
					<TypeBadge {type} size="sm" />
				{/each}
			</div>
		</div>
	</div>
	<div class="mt-3 flex items-center gap-3 border-t pt-3">
		<StatShape stats={entry.stats} class="size-12" />
		<dl class="grid flex-1 grid-cols-3 gap-x-2 gap-y-0.5 text-xs">
			{#each STAT_KEYS as key, i (key)}
				<div class={cn("flex justify-between gap-1", emphasis.includes(key) && "font-semibold")}>
					<dt class="text-muted-foreground">{STAT_LABELS[key].short}</dt>
					<dd class="tabular">{entry.stats[i]}</dd>
				</div>
			{/each}
		</dl>
	</div>
	<dl class="mt-2 grid gap-0.5 text-xs">
		<div class={cn("flex justify-between", emphasis.includes("total") && "font-semibold")}>
			<dt class="text-muted-foreground">Base stat total</dt>
			<dd class="tabular">{statTotal(entry)}</dd>
		</div>
		{#each notes as note (note.label)}
			<div class="flex justify-between font-semibold">
				<dt class="font-normal text-muted-foreground">{note.label}</dt>
				<dd class="tabular">{note.value}</dd>
			</div>
		{/each}
	</dl>
</div>
