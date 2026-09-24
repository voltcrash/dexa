<script lang="ts">
	import { titleCase } from "$lib/pokemon/format.js";
	import { typeTextClass, type TypeName } from "$lib/pokemon/types.js";
	import { cn } from "$lib/utils.js";

	let {
		type,
		size = "md",
		href,
		class: className,
	}: { type: TypeName; size?: "sm" | "md" | "lg"; href?: string; class?: string } = $props();

	const classes = $derived(
		cn(
			"inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap",
			typeTextClass(type),
			size === "sm" && "h-5 px-2 text-[0.6875rem]",
			size === "md" && "h-6 px-2.5 text-xs",
			size === "lg" && "h-8 px-3.5 text-sm",
			className,
		),
	);
</script>

{#if href}
	<a {href} class={classes} style:background-color="var(--type-{type})">{titleCase(type)}</a>
{:else}
	<span class={classes} style:background-color="var(--type-{type})">{titleCase(type)}</span>
{/if}
