<script lang="ts">
	import type { DamageClass } from "$lib/data/types.js";
	import { cn } from "$lib/utils.js";

	let { value, class: className }: { value: DamageClass; class?: string } = $props();

	const labels: Record<DamageClass, string> = {
		physical: "Physical",
		special: "Special",
		status: "Status",
	};
</script>

<span
	class={cn("inline-flex h-5 items-center gap-1 rounded-full px-2 text-[0.6875rem] font-medium", {
		"bg-[#f4d9cf] text-[#8a2f12] dark:bg-[#4a2418] dark:text-[#ffb59c]": value === "physical",
		"bg-[#d7e2f7] text-[#233f86] dark:bg-[#1c2d52] dark:text-[#a8c2ff]": value === "special",
		"bg-muted text-muted-foreground": value === "status",
	}, className)}
>
	<svg viewBox="0 0 12 12" class="size-2.5" aria-hidden="true">
		{#if value === "physical"}
			<path d="M6 0l1.6 3.8L12 4.4 8.6 7.2 9.6 12 6 9.6 2.4 12l1-4.8L0 4.4l4.4-.6z" fill="currentColor" />
		{:else if value === "special"}
			<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="2" /><circle cx="6" cy="6" r="1.8" fill="currentColor" />
		{:else}
			<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="2" />
		{/if}
	</svg>
	{labels[value]}
</span>
