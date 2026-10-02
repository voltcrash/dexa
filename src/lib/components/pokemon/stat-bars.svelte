<script lang="ts">
	import * as ToggleGroup from "#lib/components/ui/toggle-group/index.js";
	import { MAX_BASE_STAT, statBand, statRanges } from "#lib/pokemon/stats.js";
	import { STAT_KEYS, STAT_LABELS, type BaseStats } from "#lib/pokemon/types.js";

	let { stats, percentiles }: { stats: BaseStats; percentiles?: number[] } = $props();

	let level = $state("100");
	const ranges = $derived(statRanges(stats, Number(level)));
	const total = $derived(stats.reduce((sum, s) => sum + s, 0));
</script>

<div class="grid gap-4">
	<div class="flex items-center justify-end gap-3 text-sm text-muted-foreground">
		<span id="stat-level-label">Range at</span>
		<ToggleGroup.Root
			type="single"
			variant="outline"
			size="sm"
			value={level}
			onValueChange={(value) => value && (level = value)}
			aria-labelledby="stat-level-label"
		>
			<ToggleGroup.Item value="50">Lv. 50</ToggleGroup.Item>
			<ToggleGroup.Item value="100">Lv. 100</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>

	<table class="w-full text-sm">
		<thead class="sr-only">
			<tr>
				<th scope="col">Stat</th>
				<th scope="col">Base</th>
				<th scope="col">Distribution</th>
				{#if percentiles}<th scope="col">Share of species with a lower base stat</th>{/if}
				<th scope="col">Range at level {level}</th>
			</tr>
		</thead>
		<tbody>
			{#each STAT_KEYS as key, i (key)}
				<tr class="border-b">
					<th scope="row" class="w-20 py-2 pr-3 text-left font-normal text-muted-foreground">
						{STAT_LABELS[key].long}
					</th>
					<td class="w-10 pr-3 text-right font-semibold tabular">{stats[i]}</td>
					<td>
						<div class="h-2 overflow-hidden rounded-sm bg-muted">
							<div
								class="h-full rounded-sm transition-[width] duration-500"
								style:width="{Math.min(100, (stats[i] / MAX_BASE_STAT) * 100)}%"
								style:background-color="var(--stat-{statBand(stats[i])})"
							></div>
						</div>
					</td>
					{#if percentiles}
						<td class="w-24 pl-4 text-right tabular">
							<span class="text-muted-foreground">beats</span>
							{percentiles[i]}%
						</td>
					{/if}
					<td class="w-24 pl-4 text-right text-muted-foreground tabular">
						{ranges[i][0]}–{ranges[i][1]}
					</td>
				</tr>
			{/each}
			<tr>
				<th scope="row" class="py-2 pr-3 text-left font-medium">Total</th>
				<td class="py-2 pr-3 text-right font-semibold tabular">{total}</td>
				<td></td>
				{#if percentiles}
					<td class="py-2 pl-4 text-right font-medium tabular">
						<span class="font-normal text-muted-foreground">beats</span>
						{percentiles[6]}%
					</td>
				{/if}
				<td></td>
			</tr>
		</tbody>
	</table>
	<p class="text-xs text-muted-foreground">
		{#if percentiles}“Beats” is the share of all species with a lower base stat.{/if}
		Ranges assume 0 IVs, 0 EVs and a hindering nature at the low end, and 31 IVs, 252 EVs and a
		helpful nature at the high end.
	</p>
</div>
