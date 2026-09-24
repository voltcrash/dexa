<script lang="ts">
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
	import {
		ABILITY_RULES,
		defensiveProfile,
		effectiveness,
		formatMultiplier,
		groupProfile,
		type DefensiveProfile,
	} from "$lib/pokemon/matchups.js";
	import { TYPES, type TypeName } from "$lib/pokemon/types.js";
	import TypeBadge from "./type-badge.svelte";

	let {
		types,
		abilities,
	}: { types: TypeName[]; abilities: { slug: string; name: string }[] } = $props();

	const relevantAbilities = $derived(abilities.filter((a) => ABILITY_RULES[a.slug]));
	let ability = $state("");

	const defense = $derived(groupProfile(defensiveProfile(types, ability || undefined)));

	// Best same-type (STAB) multiplier against each single defending type.
	const offense = $derived.by(() => {
		const profile = {} as DefensiveProfile;
		for (const target of TYPES) {
			profile[target] = Math.max(...types.map((t) => effectiveness(t, [target])));
		}
		return groupProfile(profile);
	});

	const defenseLabel = (m: number) =>
		m === 0 ? "Immune" : m > 1 ? `Weak ${formatMultiplier(m)}` : `Resists ${formatMultiplier(m)}`;
	const offenseLabel = (m: number) =>
		m === 0 ? "No effect" : m > 1 ? `Super effective ${formatMultiplier(m)}` : `Not very effective ${formatMultiplier(m)}`;
</script>

<div class="grid gap-10 lg:grid-cols-2">
	<div>
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h3 class="font-medium">Taking hits</h3>
			{#if relevantAbilities.length}
				<ToggleGroup.Root
					type="single"
					size="sm"
					variant="outline"
					value={ability || "none"}
					onValueChange={(value) => (ability = value === "none" ? "" : (value ?? ""))}
					aria-label="Account for an ability"
				>
					<ToggleGroup.Item value="none">Types only</ToggleGroup.Item>
					{#each relevantAbilities as a (a.slug)}
						<ToggleGroup.Item value={a.slug}>With {a.name}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			{/if}
		</div>
		{#if ability}
			<p class="mt-2 text-sm text-muted-foreground">{ABILITY_RULES[ability].note}.</p>
		{/if}
		{@render groups(defense, defenseLabel, "Takes neutral damage from every type.")}
	</div>
	<div>
		<h3 class="font-medium">Same-type attacks</h3>
		{@render groups(offense, offenseLabel, "Hits every type for neutral damage.")}
	</div>
</div>

{#snippet groups(list: ReturnType<typeof groupProfile>, label: (m: number) => string, empty: string)}
	{#if list.length}
		<dl class="mt-4 divide-y">
			{#each list as group (group.multiplier)}
				<div class="grid gap-2 py-3 sm:grid-cols-[11rem_1fr] sm:items-center">
					<dt class="text-sm {group.multiplier > 1 ? 'font-medium' : 'text-muted-foreground'}">
						{label(group.multiplier)}
					</dt>
					<dd class="flex flex-wrap gap-1.5">
						{#each group.types as type (type)}
							<TypeBadge {type} />
						{/each}
					</dd>
				</div>
			{/each}
		</dl>
	{:else}
		<p class="mt-4 text-sm text-muted-foreground">{empty}</p>
	{/if}
{/snippet}
