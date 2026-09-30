<script lang="ts">
	import XIcon from "@lucide/svelte/icons/x";
	import { describeFilter, parseSearch, removeToken } from "$lib/dex/filters.js";

	let { q, onchange }: { q: string; onchange: (q: string) => void } = $props();

	const search = $derived(parseSearch(q));
</script>

{#if search.filters.length || search.invalid.length}
	<ul class="flex flex-wrap gap-1.5" aria-label="Filters in your search">
		{#each search.filters as filter (filter.raw)}
			<li class="inline-flex h-7 items-center gap-1 rounded-md border bg-card pr-1 pl-2.5 text-sm">
				{describeFilter(filter)}
				<button
					type="button"
					onclick={() => onchange(removeToken(q, filter.raw))}
					class="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
					aria-label="Remove {describeFilter(filter)}"
				>
					<XIcon class="size-3.5" />
				</button>
			</li>
		{/each}
		{#each search.invalid as raw (raw)}
			<li class="inline-flex h-7 items-center gap-1 rounded-md border border-destructive/40 pr-1 pl-2.5 text-sm text-destructive">
				Can’t read <code class="font-medium">{raw}</code>
				<button
					type="button"
					onclick={() => onchange(removeToken(q, raw))}
					class="rounded-sm p-0.5 hover:bg-destructive/10"
					aria-label="Remove {raw}"
				>
					<XIcon class="size-3.5" />
				</button>
			</li>
		{/each}
	</ul>
{/if}
