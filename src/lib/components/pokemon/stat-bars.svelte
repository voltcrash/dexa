<script lang="ts">
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
	import { MAX_BASE_STAT, statRanges } from "$lib/pokemon/stats.js";
	import { STAT_KEYS, STAT_LABELS, type BaseStats } from "$lib/pokemon/types.js";

	let { stats }: { stats: BaseStats } = $props();

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

	<table class="w-full border-separate border-spacing-y-2 text-sm">
		<thead class="sr-only">
			<tr>
				<th scope="col">Stat</th>
				<th scope="col">Base</th>
				<th scope="col">Distribution</th>
				<th scope="col">Range at level {level}</th>
			</tr>
		</thead>
		<tbody>
			{#each STAT_KEYS as key, i (key)}
				<tr>
					<th scope="row" class="w-20 pr-3 text-left font-normal text-muted-foreground">
						{STAT_LABELS[key].long}
					</th>
					<td class="w-10 pr-3 text-right font-semibold tabular">{stats[i]}</td>
					<td>
						<div class="h-2.5 overflow-hidden rounded-full bg-muted">
							<div
								class="h-full rounded-full bg-tint transition-[width] duration-500"
								style:width="{Math.min(100, (stats[i] / MAX_BASE_STAT) * 100)}%"
							></div>
						</div>
					</td>
					<td class="w-24 pl-4 text-right text-muted-foreground tabular">
						{ranges[i][0]}–{ranges[i][1]}
					</td>
				</tr>
			{/each}
			<tr>
				<th scope="row" class="pt-2 pr-3 text-left font-medium">Total</th>
				<td class="pt-2 pr-3 text-right font-semibold tabular">{total}</td>
				<td colspan="2"></td>
			</tr>
		</tbody>
	</table>
	<p class="text-xs text-muted-foreground">
		Ranges assume 0 IVs, 0 EVs and a hindering nature at the low end, and 31 IVs, 252 EVs and a
		helpful nature at the high end.
	</p>
</div>
