<script lang="ts">
	import { onMount, tick } from "svelte";
	import PokemonArt from "$lib/components/pokemon/pokemon-art.svelte";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import CryButton from "$lib/components/pokemon/cry-button.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
	import { loadDexList } from "$lib/dex/client.js";
	import type { DexListEntry } from "$lib/dex/list.js";
	import { dexNumber } from "$lib/pokemon/format.js";
	import { GENERATIONS } from "$lib/pokemon/generations.js";
	import { cryUrl } from "$lib/pokemon/sprites.js";
	import { isCorrectGuess, nameHint, pickRandom } from "$lib/quiz/game.js";

	const BEST_KEY = "dexa:quiz-best";

	let pool = $state<DexListEntry[]>([]);
	let gens = $state<string[]>([]);
	let current = $state<DexListEntry | undefined>();
	let recent: number[] = [];
	let guess = $state("");
	let hints = $state(0);
	let outcome = $state<"playing" | "correct" | "revealed">("playing");
	let wrong = $state(false);
	let streak = $state(0);
	let best = $state(0);
	let input = $state<HTMLInputElement | null>(null);
	let nextButton = $state<HTMLButtonElement | null>(null);

	const candidates = $derived(
		pool.filter((e) => e.isDefault && (gens.length === 0 || gens.includes(String(e.generation)))),
	);
	const letterHints = $derived(Math.max(0, hints - 2));

	onMount(async () => {
		try {
			best = Number(localStorage.getItem(BEST_KEY)) || 0;
		} catch {
			best = 0;
		}
		pool = await loadDexList();
		next();
	});

	async function next() {
		current = pickRandom(candidates, recent);
		if (current) recent = [current.speciesId, ...recent].slice(0, 50);
		guess = "";
		hints = 0;
		wrong = false;
		outcome = "playing";
		await tick();
		input?.focus();
	}

	async function finish(result: "correct" | "revealed") {
		outcome = result;
		if (result === "correct") {
			streak++;
			if (streak > best) {
				best = streak;
				try {
					localStorage.setItem(BEST_KEY, String(best));
				} catch {
					// Best streak just won't persist in this browser.
				}
			}
		} else {
			streak = 0;
		}
		await tick();
		nextButton?.focus();
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!current || outcome !== "playing") return;
		if (isCorrectGuess(guess, current)) finish("correct");
		else {
			wrong = true;
			input?.select();
		}
	}
</script>

<svelte:head>
	<title>Who’s that Pokémon? | Dexa</title>
	<meta name="description" content="Guess the Pokémon from its silhouette. Pick generations, use hints, and build a streak." />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 pt-10 pb-8 sm:px-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Who’s that Pokémon?</h1>
		<dl class="flex gap-6 text-sm">
			<div>
				<dt class="text-muted-foreground">Streak</dt>
				<dd class="font-display text-2xl font-semibold tabular">{streak}</dd>
			</div>
			<div>
				<dt class="text-muted-foreground">Best</dt>
				<dd class="font-display text-2xl font-semibold tabular">{best}</dd>
			</div>
		</dl>
	</div>

	<div class="mt-6 overflow-x-auto [scrollbar-width:none]">
		<ToggleGroup.Root
			type="multiple"
			variant="outline"
			size="sm"
			value={gens}
			onValueChange={(value) => {
				gens = value;
				streak = 0;
				next();
			}}
			aria-label="Limit to generations"
		>
			{#each GENERATIONS as gen (gen.id)}
				<ToggleGroup.Item value={String(gen.id)} aria-label="Generation {gen.numeral}, {gen.region}" class="min-w-9">
					{gen.numeral}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
		<p class="mt-2 text-xs text-muted-foreground">
			{gens.length ? "Only the selected generations appear." : "All generations appear. Pick some to narrow it down."}
		</p>
	</div>

	<div
		class="relative mt-6 overflow-hidden rounded-[2.5rem] p-6 sm:p-8 transition-colors duration-500 {outcome === 'playing' ? 'bg-secondary' : 'tint-field'}"
		style:--tint={current ? `var(--type-${current.types[0]})` : undefined}
	>
		{#if current}
			{#key current.id}
				<PokemonArt
					id={current.id}
					name={outcome === "playing" ? "Mystery Pokémon silhouette" : current.name}
					eager
					width={512}
					widths={[384, 512]}
					sizes="(min-width: 640px) 20rem, 16rem"
					class="mx-auto max-w-[16rem] transition-[filter] sm:max-w-xs duration-700 {outcome === 'playing' ? 'brightness-0 dark:invert' : ''}"
				/>
			{/key}
		{:else}
			<div class="mx-auto aspect-square max-w-[16rem] sm:max-w-xs"></div>
		{/if}
	</div>

	<div class="mt-6" aria-live="polite">
		{#if !current}
			<p class="text-muted-foreground">Loading the Pokédex…</p>
		{:else if outcome === "playing"}
			<form onsubmit={submit} class="flex gap-2">
				<Input
					bind:ref={input}
					bind:value={guess}
					oninput={() => (wrong = false)}
					placeholder="Type your guess"
					aria-label="Your guess"
					aria-invalid={wrong}
					autocomplete="off"
					spellcheck={false}
					class="h-11 text-base md:text-base"
				/>
				<Button type="submit" size="lg" class="h-11 px-5">Guess</Button>
			</form>
			{#if wrong}
				<p class="mt-2 text-sm text-destructive">Not quite. Try again or take a hint.</p>
			{/if}

			<div class="mt-4 flex flex-wrap items-center gap-2">
				<Button variant="outline" size="sm" onclick={() => hints++} disabled={letterHints >= current.name.length}>
					{hints === 0 ? "Show types" : hints === 1 ? "Show generation" : "Reveal a letter"}
				</Button>
				<CryButton url={cryUrl(current.id)} name="the mystery Pokémon" />
				<Button variant="ghost" size="sm" class="ml-auto" onclick={() => finish("revealed")}>Give up</Button>
			</div>

			{#if hints > 0}
				<div class="mt-4 flex flex-wrap items-center gap-3 text-sm">
					<span class="flex gap-1">
						{#each current.types as type (type)}
							<TypeBadge {type} />
						{/each}
					</span>
					{#if hints > 1}
						<span class="text-muted-foreground">Generation {GENERATIONS[current.generation - 1]?.numeral}</span>
					{/if}
					{#if letterHints > 0}
						<span class="font-display tracking-[0.2em]">{nameHint(current.name, letterHints)}</span>
					{/if}
				</div>
			{/if}
		{:else}
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p class="text-sm text-muted-foreground">
						{outcome === "correct" ? "Correct. It’s" : "It’s"}
					</p>
					<p class="font-display text-3xl font-semibold">
						{current.name}
						<span class="text-lg font-medium text-muted-foreground tabular">{dexNumber(current.speciesId)}</span>
					</p>
					<a href="/pokemon/{current.slug}" class="text-sm underline underline-offset-4 hover:text-primary">
						Open its Pokédex page
					</a>
				</div>
				<Button bind:ref={nextButton} size="lg" onclick={next}>Next Pokémon</Button>
			</div>
		{/if}
	</div>
</div>
