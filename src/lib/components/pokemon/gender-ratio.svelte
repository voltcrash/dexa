<script lang="ts">
	import { formatPercent, genderRatio } from "$lib/pokemon/format.js";

	let { rate }: { rate: number } = $props();
	const ratio = $derived(genderRatio(rate));
</script>

{#if ratio}
	<div class="grid gap-1.5">
		<div class="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
			<div class="bg-[#3d7dd8]" style:width="{ratio.male}%"></div>
			<div class="bg-[#e0569b]" style:width="{ratio.female}%"></div>
		</div>
		<p class="text-sm tabular">
			<span class="text-[#3d7dd8] dark:text-[#7aa9ef]">♂ {formatPercent(ratio.male)}</span>
			<span class="ml-3 text-[#c23b7f] dark:text-[#f08cbf]">♀ {formatPercent(ratio.female)}</span>
		</p>
	</div>
{:else}
	<p class="text-sm">Genderless</p>
{/if}
