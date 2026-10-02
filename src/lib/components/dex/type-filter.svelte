<script lang="ts">
	import { titleCase } from "#lib/pokemon/format.js";
	import { TYPES, typeTextClass, type TypeName } from "#lib/pokemon/types.js";
	import { cn } from "#lib/utils.js";

	let { selected, onchange }: { selected: TypeName[]; onchange: (types: TypeName[]) => void } =
		$props();

	function toggle(type: TypeName) {
		if (selected.includes(type)) onchange(selected.filter((t) => t !== type));
		// A Pokémon has at most two types, so a third pick replaces the oldest.
		else onchange([...selected, type].slice(-2));
	}
</script>

<div
	role="group"
	aria-label="Filter by type"
	class="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-9"
>
	{#each TYPES as type (type)}
		{@const active = selected.includes(type)}
		<button
			type="button"
			aria-pressed={active}
			onclick={() => toggle(type)}
			style:--chip="var(--type-{type})"
			class={cn(
				"inline-flex h-8 shrink-0 items-center gap-2 rounded-sm border px-2.5 text-xs font-medium transition-colors",
				active
					? cn("border-transparent bg-(--chip)", typeTextClass(type))
					: "bg-card text-muted-foreground hover:border-(--chip) hover:text-foreground",
			)}
		>
			<span
				class={cn("h-3 w-1 rounded-full", active ? "bg-current opacity-50" : "bg-(--chip)")}
				aria-hidden="true"
			></span>
			{titleCase(type)}
		</button>
	{/each}
</div>
