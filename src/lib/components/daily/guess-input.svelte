<script lang="ts">
	import { Input } from "#lib/components/ui/input/index.js";
	import { DEFAULT_QUERY, queryDex, type DexListEntry } from "#lib/dex/list.js";
	import { cn } from "#lib/utils.js";

	let {
		pool,
		exclude,
		disabled = false,
		onguess,
	}: {
		pool: DexListEntry[];
		exclude: Set<number>;
		disabled?: boolean;
		onguess: (entry: DexListEntry) => void;
	} = $props();

	let text = $state("");
	let highlighted = $state(0);
	let input = $state<HTMLInputElement | null>(null);

	// Only names are searched here; filters like spe>100 would give the answer away.
	const options = $derived(
		text.trim() && !/[:<>=]/.test(text)
			? queryDex(pool, { ...DEFAULT_QUERY, q: text })
					.filter((e) => !exclude.has(e.id))
					.slice(0, 6)
			: [],
	);

	function submit(entry: DexListEntry | undefined) {
		if (!entry) return;
		onguess(entry);
		text = "";
		highlighted = 0;
		input?.focus();
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === "ArrowDown") highlighted = Math.min(options.length - 1, highlighted + 1);
		else if (event.key === "ArrowUp") highlighted = Math.max(0, highlighted - 1);
		else if (event.key === "Enter") submit(options[highlighted]);
		else if (event.key === "Escape") text = "";
		else return;
		event.preventDefault();
	}
</script>

<div class="relative">
	<Input
		bind:ref={input}
		bind:value={text}
		oninput={() => (highlighted = 0)}
		{onkeydown}
		{disabled}
		role="combobox"
		aria-expanded={options.length > 0}
		aria-controls="daily-options"
		aria-activedescendant={options.length ? `daily-option-${options[highlighted]?.id}` : undefined}
		aria-autocomplete="list"
		aria-label="Guess a Pokémon"
		placeholder={disabled ? "Come back tomorrow for a new Pokémon" : "Type a Pokémon’s name"}
		autocomplete="off"
		spellcheck={false}
		class="h-11 rounded-lg bg-card text-base md:text-base"
	/>
	{#if options.length}
		<ul id="daily-options" role="listbox" aria-label="Matching Pokémon" class="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border bg-popover py-1 shadow-lg">
			{#each options as entry, i (entry.id)}
				<li
					id="daily-option-{entry.id}"
					role="option"
					aria-selected={i === highlighted}
					class={cn("cursor-pointer px-3 py-2", i === highlighted && "bg-muted")}
					onpointerenter={() => (highlighted = i)}
					onpointerdown={(event) => {
						event.preventDefault();
						submit(entry);
					}}
				>
					{entry.name}
				</li>
			{/each}
		</ul>
	{/if}
</div>
