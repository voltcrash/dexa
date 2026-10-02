<script lang="ts">
	import { nameFit } from "#lib/pokemon/name-fit.js";

	let { name }: { name: string } = $props();

	const fit = $derived(nameFit(name));

	// The CSS estimate can overshoot for unusually wide letters; shrink until it fits.
	function shrinkToFit(node: HTMLElement) {
		const parent = node.parentElement;
		if (!parent) return;
		const fitNow = () => {
			node.style.fontSize = "";
			const overflow = node.scrollWidth / parent.clientWidth;
			if (overflow > 1) {
				node.style.fontSize = `${parseFloat(getComputedStyle(node).fontSize) / overflow}px`;
			}
		};
		const observer = new ResizeObserver(fitNow);
		observer.observe(parent);
		document.fonts.ready.then(fitNow);
		return () => observer.disconnect();
	}
</script>

<div class="@container">
	{#key name}
		<h1
			{@attach shrinkToFit}
			class="fitted leading-[0.95] font-bold tracking-tight whitespace-nowrap"
			style:--stretch="{fit.stretch}%"
			style:--em={fit.em}
			style:--chars={fit.chars}
		>
			{name}
		</h1>
	{/key}
</div>

<style>
	.fitted {
		font-stretch: var(--stretch);
		font-size: min(9rem, calc(100cqi / var(--chars) / var(--em) * 0.97));
	}
</style>
