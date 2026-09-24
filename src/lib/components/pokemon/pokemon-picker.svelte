<script lang="ts">
	import * as Command from "$lib/components/ui/command/index.js";
	import { loadDexList } from "$lib/dex/client.js";
	import { DEFAULT_QUERY, queryDex, type DexListEntry } from "$lib/dex/list.js";
	import { optimizedImage } from "$lib/images.js";
	import { dexNumber } from "$lib/pokemon/format.js";
	import { artworkUrl } from "$lib/pokemon/sprites.js";
	import TypeBadge from "./type-badge.svelte";

	let {
		open = $bindable(false),
		title = "Choose a Pokémon",
		onpick,
	}: { open?: boolean; title?: string; onpick: (entry: DexListEntry) => void } = $props();

	let search = $state("");
	let entries = $state<DexListEntry[]>([]);

	$effect(() => {
		if (open && entries.length === 0) loadDexList().then((list) => (entries = list));
		if (!open) search = "";
	});

	const results = $derived(
		queryDex(entries, { ...DEFAULT_QUERY, q: search, forms: search.trim().length > 0 }).slice(0, 30),
	);

	function pick(entry: DexListEntry) {
		onpick(entry);
		open = false;
	}
</script>

<Command.Dialog bind:open shouldFilter={false} {title} description="Search by name or number" class="sm:max-w-lg">
	<Command.Input bind:value={search} placeholder="Search by name or number" />
	<Command.List class="max-h-[min(60vh,26rem)]">
		<Command.Empty>{entries.length ? "No Pokémon match that search." : "Loading the Pokédex…"}</Command.Empty>
		{#each results as entry (entry.id)}
			<Command.Item value="pick-{entry.slug}" onSelect={() => pick(entry)} class="gap-3">
				<img src={optimizedImage(artworkUrl(entry.id), 96)} alt="" width="36" height="36" loading="lazy" class="size-9 object-contain" />
				<span class="flex min-w-0 flex-1 flex-col">
					<span class="truncate font-medium">{entry.name}</span>
					<span class="text-xs text-muted-foreground tabular">{dexNumber(entry.speciesId)}</span>
				</span>
				<span class="flex gap-1">
					{#each entry.types as type (type)}
						<TypeBadge {type} size="sm" />
					{/each}
				</span>
			</Command.Item>
		{/each}
	</Command.List>
</Command.Dialog>
