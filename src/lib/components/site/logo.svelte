<script lang="ts">
	import { cn } from "#lib/utils.js";

	let { class: className }: { class?: string } = $props();
</script>

<!-- A stat shape inside its hexagonal rim, the device Dexa draws for every Pokémon. -->
<svg viewBox="0 0 32 32" aria-hidden="true" class={cn("size-7 shrink-0", className)}>
	<rect width="32" height="32" rx="7" class="fill-foreground" />
	<polygon
		points="16,5 25.53,10.5 25.53,21.5 16,27 6.47,21.5 6.47,10.5"
		fill="none"
		stroke-width="1.25"
		stroke-linejoin="round"
		class="stroke-background opacity-40"
	/>
	<polygon
		points="16,5.55 22.67,12.15 20.76,18.75 16,25.9 10.76,19.03 8.38,11.6"
		stroke-width="1.25"
		stroke-linejoin="round"
		class="fill-background stroke-background"
	/>
</svg>
