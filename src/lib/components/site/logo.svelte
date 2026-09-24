<script lang="ts">
	import { cn } from "$lib/utils.js";

	let { class: className }: { class?: string } = $props();
</script>

<svg viewBox="0 0 32 32" aria-hidden="true" class={cn("size-7 shrink-0", className)}>
	<rect width="32" height="32" rx="9" class="fill-primary" />
	<circle cx="16" cy="16" r="9" fill="#fff" />
	<circle cx="16" cy="16" r="5.5" fill="#3d7dd8" />
	<circle cx="14" cy="14" r="1.8" fill="#fff" opacity=".85" />
</svg>
