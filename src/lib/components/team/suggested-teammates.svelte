<script lang="ts">
	import PlusIcon from "@lucide/svelte/icons/plus";
	import PokemonArt from "$lib/components/pokemon/pokemon-art.svelte";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import type { DexListEntry } from "$lib/dex/list.js";
	import { titleCase } from "$lib/pokemon/format.js";
	import type { Suggestion } from "$lib/team/analysis.js";

	let {
		suggestions,
		onadd,
	}: { suggestions: Suggestion<DexListEntry>[]; onadd: (entry: DexListEntry) => void } = $props();

	const list = (types: string[]) => types.map(titleCase).join(", ");
</script>

<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
	{#each suggestions as { entry, covers, hits } (entry.id)}
		<li class="flex gap-3 rounded-lg border bg-card p-2 pr-3" style:--tint="var(--type-{entry.types[0]})">
			<span class="tint-field grid size-16 shrink-0 place-items-center self-start rounded-md p-1">
				<PokemonArt id={entry.id} name="" width={96} widths={[96, 192]} sizes="64px" />
			</span>
			<div class="min-w-0 flex-1 py-0.5">
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0">
						<a href="/pokemon/{entry.slug}" class="block truncate font-medium hover:underline hover:underline-offset-4">{entry.name}</a>
						<div class="mt-1 flex gap-1">
							{#each entry.types as type (type)}
								<TypeBadge {type} size="sm" />
							{/each}
						</div>
					</div>
					<Button variant="outline" size="icon-sm" onclick={() => onadd(entry)} aria-label="Add {entry.name} to your team" title="Add to team">
						<PlusIcon />
					</Button>
				</div>
				<dl class="mt-2 grid gap-0.5 text-sm">
					{#if covers.length}
						<div class="flex gap-1.5">
							<dt class="shrink-0 text-muted-foreground">Resists</dt>
							<dd>{list(covers)}</dd>
						</div>
					{/if}
					{#if hits.length}
						<div class="flex gap-1.5">
							<dt class="shrink-0 text-muted-foreground">Hits</dt>
							<dd>{list(hits)}</dd>
						</div>
					{/if}
				</dl>
			</div>
		</li>
	{/each}
</ul>
