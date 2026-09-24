<script lang="ts">
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import type { EvolutionNode } from "$lib/pokemon/evolution-tree.js";
	import { dexNumber } from "$lib/pokemon/format.js";
	import { cn } from "$lib/utils.js";
	import PokemonArt from "./pokemon-art.svelte";
	import TypeBadge from "./type-badge.svelte";

	let { root, currentSpeciesId }: { root: EvolutionNode; currentSpeciesId: number } = $props();
</script>

{#snippet card(node: EvolutionNode)}
	{@const current = node.speciesId === currentSpeciesId}
	<a
		href="/pokemon/{node.slug}"
		aria-current={current ? "page" : undefined}
		style:--tint="var(--type-{node.types[0]})"
		class={cn(
			"group flex w-40 shrink-0 flex-col items-center gap-1 rounded-2xl border border-transparent p-3 text-center transition-colors hover:border-(--tint)",
			current && "border-(--tint) bg-card",
		)}
	>
		<div class="tint-field w-full rounded-xl p-2">
			<PokemonArt id={node.speciesId} name={node.name} width={192} widths={[192, 256]} sizes="140px" />
		</div>
		<span class="mt-1 text-xs text-muted-foreground tabular">{dexNumber(node.speciesId)}</span>
		<span class="leading-tight font-medium">{node.name}</span>
		<span class="mt-1 flex gap-1">
			{#each node.types as type (type)}
				<TypeBadge {type} size="sm" />
			{/each}
		</span>
	</a>
{/snippet}

{#snippet conditions(node: EvolutionNode, vertical: boolean)}
	<div class="flex max-w-40 flex-col items-center gap-1 px-2 text-center text-xs text-muted-foreground">
		<ArrowRightIcon class={cn("size-4", vertical ? "rotate-90" : "rotate-90 md:rotate-0")} aria-hidden="true" />
		{#each node.conditions as condition (condition)}
			<span>{condition}</span>
		{:else}
			<span>Special</span>
		{/each}
	</div>
{/snippet}

{#snippet branch(node: EvolutionNode)}
	{#if node.children.length > 2}
		<!-- Wide branches like Eevee read better as a grid under the parent. -->
		<div class="flex flex-col items-center gap-4">
			{@render card(node)}
			<ul class="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
				{#each node.children as child (child.speciesId)}
					<li class="flex flex-col items-center gap-2">
						{@render conditions(child, true)}
						{@render branch(child)}
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<div class="flex flex-col items-center gap-2 md:flex-row md:items-center">
			{@render card(node)}
			{#if node.children.length}
				<ul class="flex flex-col gap-4">
					{#each node.children as child (child.speciesId)}
						<li class="flex flex-col items-center gap-2 md:flex-row">
							{@render conditions(child, false)}
							{@render branch(child)}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
{/snippet}

{#if root.children.length}
	<div class="overflow-x-auto pb-2">
		{@render branch(root)}
	</div>
{:else}
	<p class="text-muted-foreground">{root.name} does not evolve.</p>
{/if}
