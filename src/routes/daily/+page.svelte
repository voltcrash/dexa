<script lang="ts">
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import CheckIcon from "@lucide/svelte/icons/check";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import XIcon from "@lucide/svelte/icons/x";
	import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import GuessInput from "#lib/components/daily/guess-input.svelte";
	import PokemonArt from "#lib/components/pokemon/pokemon-art.svelte";
	import StatShape from "#lib/components/pokemon/stat-shape.svelte";
	import { Button } from "#lib/components/ui/button/index.js";
	import {
		MAX_GUESSES,
		answerFor,
		compareGuess,
		dateKey,
		puzzleNumber,
		shareText,
		type Hint,
	} from "#lib/daily/game.js";
	import { loadDexList } from "#lib/dex/client.js";
	import type { DexListEntry } from "#lib/dex/list.js";
	import { dexNumber } from "#lib/pokemon/format.js";
	import { cn } from "#lib/utils.js";

	const STORAGE_KEY = "dexa:daily";
	/** Misses before the answer's stat shape is shown as a hint. */
	const SHAPE_HINT_AFTER = 3;

	type History = Record<string, { guesses: string[]; won: boolean }>;

	let pool = $state<DexListEntry[]>([]);
	let today = $state(new Date());
	let guesses = $state<string[]>([]);
	let history = $state<History>({});
	let now = $state(Date.now());

	const key = $derived(dateKey(today));
	const puzzle = $derived(puzzleNumber(today));
	const bySlug = $derived(new Map(pool.map((e) => [e.slug, e])));
	const answer = $derived(pool.length ? answerFor(puzzle, pool) : undefined);
	const guessed = $derived(guesses.flatMap((slug) => bySlug.get(slug) ?? []));
	const rows = $derived(answer ? guessed.map((g) => compareGuess(g, answer)) : []);
	const won = $derived(Boolean(answer && guesses.includes(answer.slug)));
	const done = $derived(won || guesses.length >= MAX_GUESSES);
	const streak = $derived.by(() => {
		let count = 0;
		const day = new Date(today);
		// Today only breaks the streak once it's lost; an unfinished puzzle still counts from yesterday.
		if (!history[dateKey(day)]?.won) day.setDate(day.getDate() - 1);
		while (history[dateKey(day)]?.won) {
			count++;
			day.setDate(day.getDate() - 1);
		}
		return count;
	});
	const untilNext = $derived.by(() => {
		const midnight = new Date(today);
		midnight.setHours(24, 0, 0, 0);
		const seconds = Math.max(0, Math.floor((midnight.getTime() - now) / 1000));
		const pad = (n: number) => String(n).padStart(2, "0");
		return `${Math.floor(seconds / 3600)}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
	});

	onMount(() => {
		try {
			history = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as History;
		} catch {
			history = {};
		}
		guesses = history[key]?.guesses ?? [];
		loadDexList().then((list) => (pool = list.filter((e) => e.isDefault)));
		const timer = setInterval(() => {
			now = Date.now();
			// Roll over to the next puzzle at local midnight.
			if (dateKey(new Date(now)) !== key) location.reload();
		}, 1000);
		return () => clearInterval(timer);
	});

	function guess(entry: DexListEntry) {
		if (done || guesses.includes(entry.slug)) return;
		guesses = [...guesses, entry.slug];
		history = { ...history, [key]: { guesses, won: entry.slug === answer?.slug } };
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
		} catch {
			// Progress still lasts for this visit without storage.
		}
	}

	async function share() {
		try {
			await navigator.clipboard.writeText(`${shareText(puzzle, rows, won)}\n${location.origin}/daily`);
			toast.success("Result copied. It doesn’t name the Pokémon.");
		} catch {
			toast.error("Couldn’t copy the result.");
		}
	}

	const HINT_TEXT: Record<Hint, string> = {
		match: "correct",
		near: "right type, other slot",
		miss: "not it",
		higher: "the answer is higher",
		lower: "the answer is lower",
	};
</script>

<svelte:head>
	<title>Daily Pokémon | Dexa</title>
	<meta name="description" content="Guess the Pokémon of the day in eight tries. Every guess shows how close its type, generation, size and stats are." />
</svelte:head>

{#snippet hintIcon(hint: Hint)}
	{#if hint === "match"}
		<CheckIcon class="size-3.5 shrink-0" />
	{:else if hint === "higher"}
		<ArrowUpIcon class="size-3.5 shrink-0" />
	{:else if hint === "lower"}
		<ArrowDownIcon class="size-3.5 shrink-0" />
	{:else if hint === "miss"}
		<XIcon class="size-3.5 shrink-0 opacity-60" />
	{:else}
		<span class="size-3.5 shrink-0 text-center text-xs leading-3.5 font-bold">~</span>
	{/if}
{/snippet}

<div class="mx-auto max-w-4xl px-4 pt-10 pb-8 sm:px-6">
	<div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
		<h1 class="page-title">Daily Pokémon</h1>
		<p class="text-muted-foreground tabular">
			Puzzle {puzzle}
			{#if streak}<span class="ml-3">Streak {streak}</span>{/if}
		</p>
	</div>
	<p class="mt-2 max-w-prose text-muted-foreground">
		One Pokémon a day, the same for everyone. You have {MAX_GUESSES} guesses, and each shows how close its types, generation, size and stat total are.
	</p>

	<ul class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground" aria-label="How to read clues">
		<li class="flex items-center gap-1.5"><span class="clue match size-5">{@render hintIcon("match")}</span> Correct</li>
		<li class="flex items-center gap-1.5"><span class="clue near size-5">{@render hintIcon("near")}</span> Right type, other slot</li>
		<li class="flex items-center gap-1.5"><span class="clue higher size-5">{@render hintIcon("higher")}</span> Answer is higher</li>
		<li class="flex items-center gap-1.5"><span class="clue lower size-5">{@render hintIcon("lower")}</span> Answer is lower</li>
	</ul>

	<div class="mt-6">
		<GuessInput {pool} exclude={new Set(guessed.map((g) => g.id))} disabled={done || !pool.length} onguess={guess} />
		<p class="mt-2 text-sm text-muted-foreground tabular" aria-live="polite">
			{#if !done}{MAX_GUESSES - guesses.length} of {MAX_GUESSES} guesses left{/if}
		</p>
	</div>

	{#if answer && !done && guesses.length >= SHAPE_HINT_AFTER}
		<div class="mt-4 flex items-center gap-4 rounded-lg border bg-card p-4">
			<StatShape stats={answer.stats} color="var(--foreground)" rings class="size-20" label="The answer’s stat shape" />
			<p class="text-sm">
				<span class="font-medium">Hint: its stat shape.</span>
				<span class="text-muted-foreground">HP is at the top, physical stats on the right, special on the left and Speed at the bottom.</span>
			</p>
		</div>
	{/if}

	{#if done && answer}
		<section aria-label="Result" class="mt-6 grid items-center gap-5 rounded-lg border bg-card p-5 sm:grid-cols-[8rem_minmax(0,1fr)]" style:--tint="var(--type-{answer.types[0]})">
			<a href="/pokemon/{answer.slug}" class="tint-field block rounded-md p-2">
				<PokemonArt id={answer.id} name={answer.name} width={256} widths={[192, 256]} sizes="8rem" eager />
			</a>
			<div>
				<p class="text-sm text-muted-foreground">{won ? `Got it in ${guesses.length}.` : "Out of guesses. It was"}</p>
				<p class="section-title mt-1">
					<a href="/pokemon/{answer.slug}" class="hover:underline hover:underline-offset-4">{answer.name}</a>
					<span class="ml-1 text-base font-normal text-muted-foreground tabular">{dexNumber(answer.speciesId)}</span>
				</p>
				<div class="mt-4 flex flex-wrap items-center gap-3">
					<Button onclick={share}>
						<CopyIcon />
						Copy result
					</Button>
					<p class="text-sm text-muted-foreground tabular">Next Pokémon in {untilNext}</p>
				</div>
			</div>
		</section>
	{/if}

	{#if rows.length}
		<div class="mt-6 overflow-x-auto">
			<table class="w-full min-w-xl border-separate border-spacing-y-1.5 text-sm">
				<thead class="text-xs text-muted-foreground">
					<tr>
						<th scope="col" class="px-2 text-left font-medium">Guess</th>
						{#each rows[0] as clue (clue.key)}
							<th scope="col" class="px-1 font-medium">{clue.label}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each rows as row, i (guessed[i].id)}
						<tr>
							<th scope="row" class="rounded-l-md bg-card py-1 pr-2 pl-1 text-left font-medium">
								<span class="flex items-center gap-2">
									<PokemonArt id={guessed[i].id} name="" width={96} widths={[96]} sizes="36px" class="size-9" />
									<span class="truncate">{guessed[i].name}</span>
								</span>
							</th>
							{#each row as clue (clue.key)}
								<td class="px-0.5">
									<span class={cn("clue h-9 w-full px-1.5", clue.hint)}>
										{@render hintIcon(clue.hint)}
										<span class="truncate tabular">{clue.value}</span>
										<span class="sr-only">, {HINT_TEXT[clue.hint]}</span>
									</span>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.clue {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		border-radius: calc(var(--radius) - 2px);
		font-weight: 500;
		background: var(--muted);
		color: var(--muted-foreground);
	}

	.clue.match {
		background: var(--stat-5);
		color: #fff;
	}

	.clue.near {
		background: var(--stat-3);
		color: #16181d;
	}

	.clue.higher,
	.clue.lower {
		background: var(--secondary);
		color: var(--foreground);
	}
</style>
