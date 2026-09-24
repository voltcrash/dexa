<script lang="ts">
	import PlusIcon from "@lucide/svelte/icons/plus";
	import XIcon from "@lucide/svelte/icons/x";
	import PokemonArt from "$lib/components/pokemon/pokemon-art.svelte";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import type { TeamMember } from "$lib/team/analysis.js";

	let {
		member,
		index,
		onadd,
		onremove,
	}: { member?: TeamMember; index: number; onadd: () => void; onremove: () => void } = $props();
</script>

{#if member}
	<div class="group relative flex flex-col" style:--tint="var(--type-{member.types[0]})">
		<a href="/pokemon/{member.slug}" class="tint-field block rounded-2xl p-[10%]">
			<PokemonArt id={member.id} name={member.name} width={256} widths={[192, 256, 384]} sizes="(min-width: 1024px) 180px, 45vw" />
		</a>
		<p class="mt-2 truncate px-1 font-medium">{member.name}</p>
		<div class="mt-1 flex gap-1 px-1">
			{#each member.types as type (type)}
				<TypeBadge {type} size="sm" />
			{/each}
		</div>
		<button
			type="button"
			onclick={onremove}
			class="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-background/85 text-muted-foreground backdrop-blur hover:text-foreground"
			aria-label="Remove {member.name}"
		>
			<XIcon class="size-4" />
		</button>
	</div>
{:else}
	<button
		type="button"
		onclick={onadd}
		class="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
	>
		<PlusIcon class="size-6" />
		Add Pokémon
		<span class="sr-only">to slot {index + 1}</span>
	</button>
{/if}
