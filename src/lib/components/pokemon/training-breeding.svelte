<script lang="ts">
	import type { PokemonDetail } from "$lib/pokemon/detail.js";
	import { STAT_LABELS, type StatKey } from "$lib/pokemon/types.js";

	let { detail }: { detail: PokemonDetail } = $props();

	const { training, breeding } = $derived(detail);
	const evYield = $derived(
		training.evYield.map((ev) => `${ev.value} ${STAT_LABELS[ev.stat as StatKey]?.long ?? ev.stat}`).join(", ") || "None",
	);
	// Egg cycles are 257 steps each in modern games (128 with Flame Body style abilities).
	const steps = $derived(breeding.hatchCycles === null ? null : breeding.hatchCycles * 257);
</script>

<div class="grid gap-10 md:grid-cols-2">
	<div>
		<h3 class="font-medium">Training</h3>
		<dl class="mt-3 divide-y text-sm">
			<div class="flex justify-between gap-4 py-2.5">
				<dt class="text-muted-foreground">EV yield</dt>
				<dd class="text-right">{evYield}</dd>
			</div>
			<div class="flex justify-between gap-4 py-2.5">
				<dt class="text-muted-foreground">Catch rate</dt>
				<dd class="tabular">{training.captureRate}</dd>
			</div>
			<div class="flex justify-between gap-4 py-2.5">
				<dt class="text-muted-foreground">Base friendship</dt>
				<dd class="tabular">{training.baseHappiness ?? "Unknown"}</dd>
			</div>
			<div class="flex justify-between gap-4 py-2.5">
				<dt class="text-muted-foreground">Base experience</dt>
				<dd class="tabular">{training.baseExperience ?? "Unknown"}</dd>
			</div>
			<div class="flex justify-between gap-4 py-2.5">
				<dt class="text-muted-foreground">Growth rate</dt>
				<dd>{training.growthRate}</dd>
			</div>
			{#if training.heldItems.length}
				<div class="flex justify-between gap-4 py-2.5">
					<dt class="text-muted-foreground">Wild held items</dt>
					<dd class="text-right">{training.heldItems.join(", ")}</dd>
				</div>
			{/if}
		</dl>
	</div>
	<div>
		<h3 class="font-medium">Breeding</h3>
		<dl class="mt-3 divide-y text-sm">
			<div class="flex justify-between gap-4 py-2.5">
				<dt class="text-muted-foreground">Egg groups</dt>
				<dd class="text-right">{breeding.eggGroups.join(", ") || "Unknown"}</dd>
			</div>
			<div class="flex justify-between gap-4 py-2.5">
				<dt class="text-muted-foreground">Egg cycles</dt>
				<dd class="tabular">
					{#if breeding.hatchCycles === null}
						Unknown
					{:else}
						{breeding.hatchCycles}
						<span class="text-muted-foreground">(about {steps?.toLocaleString("en")} steps)</span>
					{/if}
				</dd>
			</div>
		</dl>
	</div>
</div>
