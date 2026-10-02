<script lang="ts">
	import { titleCase } from "#lib/pokemon/format.js";
	import { typeTextClass, type TypeName } from "#lib/pokemon/types.js";
	import { cn } from "#lib/utils.js";

	let {
		type,
		size = "md",
		href,
		class: className,
	}: { type: TypeName; size?: "sm" | "md" | "lg"; href?: string; class?: string } = $props();

	const classes = $derived(
		cn(
			"inline-flex items-center justify-center rounded-sm font-medium whitespace-nowrap",
			typeTextClass(type),
			size === "sm" && "h-5 min-w-14 px-1.5 text-[0.6875rem]",
			size === "md" && "h-6 min-w-16 px-2 text-xs",
			size === "lg" && "h-8 min-w-20 px-3 text-sm",
			className,
		),
	);
</script>

{#if href}
	<a {href} class={classes} style:background-color="var(--type-{type})">{titleCase(type)}</a>
{:else}
	<span class={classes} style:background-color="var(--type-{type})">{titleCase(type)}</span>
{/if}
