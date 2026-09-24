<script lang="ts">
	import DicesIcon from "@lucide/svelte/icons/dices";
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import { goto } from "$app/navigation";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import * as Command from "$lib/components/ui/command/index.js";
	import { loadDexList } from "$lib/dex/client.js";
	import { DEFAULT_QUERY, queryDex, type DexListEntry } from "$lib/dex/list.js";
	import { matchScore } from "$lib/dex/search.js";
	import { optimizedImage } from "$lib/images.js";
	import { navItems } from "$lib/nav.js";
	import { dexNumber, titleCase } from "$lib/pokemon/format.js";
	import { artworkUrl } from "$lib/pokemon/sprites.js";
	import { TYPES } from "$lib/pokemon/types.js";
	import { palette } from "./palette-state.svelte.js";

	let search = $state("");
	let entries = $state<DexListEntry[]>([]);

	$effect(() => {
		if (palette.open && entries.length === 0) {
			loadDexList().then((list) => (entries = list));
		}
	});

	$effect(() => {
		if (!palette.open) search = "";
	});

	const pokemon = $derived(search.trim() ? queryDex(entries, { ...DEFAULT_QUERY, q: search }).slice(0, 8) : []);
	const types = $derived(search.trim() ? TYPES.filter((t) => matchScore(search, t) !== null).slice(0, 3) : []);
	const pages = $derived(navItems.filter((item) => !search.trim() || matchScore(search, item.label) !== null));

	function open(href: string) {
		palette.open = false;
		goto(href);
	}

	function surprise() {
		const defaults = entries.filter((e) => e.isDefault);
		const pick = defaults[Math.floor(Math.random() * defaults.length)];
		if (pick) open(`/pokemon/${pick.slug}`);
	}

	function onkeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		const typing = target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
		if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
			event.preventDefault();
			palette.open = !palette.open;
		}
	}
</script>

<svelte:window {onkeydown} />

<Command.Dialog
	bind:open={palette.open}
	shouldFilter={false}
	title="Search Dexa"
	description="Find a Pokémon, type or page"
	class="sm:max-w-xl"
>
	<Command.Input bind:value={search} placeholder="Search Pokémon, types and pages" />
	<Command.List class="max-h-[min(60vh,28rem)]">
		<Command.Empty>No matches. Try a name or a dex number such as 25.</Command.Empty>

		{#if pokemon.length}
			<Command.Group heading="Pokémon">
				{#each pokemon as entry (entry.id)}
					<Command.Item value="pokemon-{entry.slug}" onSelect={() => open(`/pokemon/${entry.slug}`)} class="gap-3">
						<img
							src={optimizedImage(artworkUrl(entry.id), 96)}
							alt=""
							width="36"
							height="36"
							loading="lazy"
							class="size-9 shrink-0 object-contain"
						/>
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
			</Command.Group>
		{/if}

		{#if types.length}
			<Command.Group heading="Types">
				{#each types as type (type)}
					<Command.Item value="type-{type}" onSelect={() => open(`/?type=${type}`)}>
						<span class="size-3 rounded-full" style:background-color="var(--type-{type})"></span>
						All {titleCase(type)} Pokémon
					</Command.Item>
				{/each}
			</Command.Group>
		{/if}

		{#if pages.length}
			<Command.Group heading="Pages">
				{#each pages as item (item.href)}
					<Command.Item value="page-{item.href}" onSelect={() => open(item.href)}>
						<FileTextIcon />
						{item.label}
					</Command.Item>
				{/each}
				{#if !search.trim()}
					<Command.Item value="random" onSelect={surprise} disabled={!entries.length}>
						<DicesIcon />
						Random Pokémon
					</Command.Item>
				{/if}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>
