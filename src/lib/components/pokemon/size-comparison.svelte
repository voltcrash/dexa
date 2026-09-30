<script lang="ts">
	import { formatHeight, formatWeight } from "$lib/pokemon/format.js";
	import { weightComparison } from "$lib/pokemon/insights.js";
	import PokemonArt from "./pokemon-art.svelte";

	let { id, name, height, weight }: { id: number; name: string; height: number; weight: number } =
		$props();

	const PERSON = 1.7;
	// Official artwork leaves a margin around the Pokémon; its body fills about this much of the frame.
	const FILL = 0.82;

	const metres = $derived(height / 10);
	const tallest = $derived(Math.max(PERSON, metres));
	const personShare = $derived((PERSON / tallest) * 100);
	const artShare = $derived((metres / tallest / FILL) * 100);
	const heightText = $derived(formatHeight(height));
	const weightText = $derived(formatWeight(weight));
</script>

<figure class="rounded-lg border bg-card p-4 sm:p-5">
	<div class="relative flex h-56 items-end justify-center gap-6 border-b border-foreground/30 sm:gap-10" aria-hidden="true">
		<svg viewBox="0 0 40 170" preserveAspectRatio="xMidYMax meet" class="w-auto fill-muted-foreground/45" style:height="{personShare}%">
			<circle cx="20" cy="11" r="10" />
			<rect x="9" y="24" width="22" height="64" rx="6" />
			<rect x="1" y="26" width="7" height="58" rx="3.5" />
			<rect x="32" y="26" width="7" height="58" rx="3.5" />
			<rect x="9.5" y="84" width="9.5" height="86" rx="4" />
			<rect x="21" y="84" width="9.5" height="86" rx="4" />
		</svg>
		<div class="flex aspect-square max-w-[60%] min-w-1 items-end" style:height="{Math.min(artShare, 100 / FILL)}%">
			<PokemonArt {id} name="" width={384} widths={[256, 384]} sizes="14rem" class="translate-y-[9%]" />
		</div>
	</div>
	<figcaption class="mt-4 grid gap-1 text-sm">
		<p>
			<span class="font-medium tabular">{heightText.metric}</span>
			<span class="text-muted-foreground tabular">{heightText.imperial}</span>
			<span class="text-muted-foreground">tall, beside a {PERSON} m person.</span>
		</p>
		<p>
			<span class="font-medium tabular">{weightText.metric}</span>
			<span class="text-muted-foreground tabular">{weightText.imperial},</span>
			<span class="text-muted-foreground">{weightComparison(weight).replace("About", "about")}.</span>
		</p>
		<span class="sr-only">{name} is {heightText.metric} tall and weighs {weightText.metric}.</span>
	</figcaption>
</figure>
