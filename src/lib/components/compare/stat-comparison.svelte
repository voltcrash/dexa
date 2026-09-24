<script lang="ts">
	import { MAX_BASE_STAT } from "$lib/pokemon/stats.js";
	import { STAT_KEYS, STAT_LABELS, type BaseStats } from "$lib/pokemon/types.js";

	let { series }: { series: { name: string; stats: BaseStats; color: string }[] } = $props();

	const rows = $derived([
		...STAT_KEYS.map((key, i) => ({
			label: STAT_LABELS[key].long,
			values: series.map((s) => s.stats[i]),
			max: MAX_BASE_STAT,
		})),
		{
			label: "Total",
			values: series.map((s) => s.stats.reduce((a, b) => a + b, 0)),
			max: Math.max(720, ...series.map((s) => s.stats.reduce((a, b) => a + b, 0))),
		},
	]);
</script>

<div class="grid gap-6">
	<ul class="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Legend">
		{#each series as s (s.name)}
			<li class="flex items-center gap-2">
				<span class="h-2.5 w-4 rounded-full" style:background-color={s.color}></span>
				{s.name}
			</li>
		{/each}
	</ul>

	<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each rows as row (row.label)}
			{@const best = Math.max(...row.values)}
			<figure class="rounded-2xl border bg-card p-4">
				<figcaption class="text-sm font-medium">{row.label}</figcaption>
				<ul class="mt-3 grid gap-1.5">
					{#each series as s, i (s.name)}
						{@const value = row.values[i]}
						<li class="group grid grid-cols-[1fr_2.5rem] items-center gap-2" title="{s.name}: {value} {row.label}">
							<span class="h-2 overflow-hidden rounded-full bg-muted">
								<span
									class="block h-full rounded-full transition-[width] duration-500"
									style:width="{(value / row.max) * 100}%"
									style:background-color={s.color}
								></span>
							</span>
							<span class="text-right text-sm tabular {value === best && series.length > 1 ? 'font-semibold' : 'text-muted-foreground'}">
								<span class="sr-only">{s.name}:</span>{value}
							</span>
						</li>
					{/each}
				</ul>
			</figure>
		{/each}
	</div>
</div>
