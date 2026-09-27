<script lang="ts">
	import { cn } from "$lib/utils.js";

	let { class: className }: { class?: string } = $props();
</script>

<svg viewBox="0 0 32 32" aria-hidden="true" class={cn("size-7 shrink-0", className)}>
	<rect width="32" height="32" rx="7" class="fill-foreground" />
	<circle cx="16" cy="16" r="8.5" fill="none" stroke-width="3" class="stroke-background" />
	<circle cx="16" cy="16" r="3.5" fill="#e3350d" />
</svg>
