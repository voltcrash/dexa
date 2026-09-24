<script lang="ts">
	import { toast } from "svelte-sonner";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import {
		LEARN_METHOD_LABELS,
		type LearnMethod,
		type Learnset,
		type LearnsetMove,
	} from "$lib/pokemon/learnset.js";
	import type { TypeName } from "$lib/pokemon/types.js";
	import DamageClassIcon from "./damage-class-icon.svelte";
	import TypeBadge from "./type-badge.svelte";

	let {
		initial,
		slug,
		types,
	}: { initial: Learnset; slug: string; types: TypeName[] } = $props();

	let learnset = $derived(initial);
	let loading = $state(false);
	let method = $state<LearnMethod>("level-up");

	const METHOD_ORDER: LearnMethod[] = ["level-up", "machine", "egg", "tutor", "other"];

	const byMethod = $derived.by(() => {
		const groups = new Map<LearnMethod, LearnsetMove[]>();
		for (const move of learnset.moves) {
			groups.set(move.method, [...(groups.get(move.method) ?? []), move]);
		}
		for (const [key, moves] of groups) {
			if (key !== "level-up") moves.sort((a, b) => a.name.localeCompare(b.name));
		}
		return groups;
	});

	const methods = $derived(METHOD_ORDER.filter((m) => byMethod.has(m)));
	const activeMethod = $derived(methods.includes(method) ? method : (methods[0] ?? "level-up"));
	const versionGroupsNewestFirst = $derived([...learnset.versionGroups].reverse());
	const selectedName = $derived(
		learnset.versionGroups.find((g) => g.slug === learnset.selected)?.name ?? "",
	);

	async function selectVersionGroup(vg: string) {
		if (vg === learnset.selected) return;
		loading = true;
		try {
			const response = await fetch(`/api/pokemon/${slug}/moves?vg=${encodeURIComponent(vg)}`);
			if (!response.ok) throw new Error(String(response.status));
			learnset = await response.json();
		} catch {
			toast.error("Couldn’t load moves for that game. Try again.");
		} finally {
			loading = false;
		}
	}

	const isStab = (move: LearnsetMove) => move.damageClass !== "status" && types.includes(move.type);
</script>

{#if learnset.moves.length === 0 && learnset.versionGroups.length === 0}
	<p class="text-muted-foreground">No move data is available for this Pokémon yet.</p>
{:else}
	<Tabs.Root value={activeMethod} onValueChange={(value) => (method = value as LearnMethod)}>
		<div class="flex flex-wrap items-center justify-between gap-3">
			<Tabs.List>
				{#each methods as m (m)}
					<Tabs.Trigger value={m}>
						{LEARN_METHOD_LABELS[m]}
						<span class="text-muted-foreground tabular">{byMethod.get(m)?.length}</span>
					</Tabs.Trigger>
				{/each}
			</Tabs.List>
			<div class="flex items-center gap-2">
				{#if loading}
					<Spinner class="text-muted-foreground" />
				{/if}
				<Select.Root type="single" value={learnset.selected} onValueChange={selectVersionGroup}>
					<Select.Trigger size="sm" class="max-w-72" aria-label="Game">
						<span class="truncate">{selectedName}</span>
					</Select.Trigger>
					<Select.Content align="end" class="max-h-80">
						{#each versionGroupsNewestFirst as group (group.slug)}
							<Select.Item value={group.slug} label={group.name} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		{#each methods as m (m)}
			<Tabs.Content value={m} class="mt-4">
				<div class="overflow-x-auto rounded-xl border bg-card {loading ? 'opacity-60' : ''}">
					<table class="w-full min-w-[40rem] text-sm">
						<thead class="border-b text-left text-xs text-muted-foreground">
							<tr>
								{#if m === "level-up"}
									<th scope="col" class="w-14 px-4 py-2.5 font-medium">Lv.</th>
								{/if}
								<th scope="col" class="px-4 py-2.5 font-medium">Move</th>
								<th scope="col" class="px-2 py-2.5 font-medium">Type</th>
								<th scope="col" class="px-2 py-2.5 font-medium">Category</th>
								<th scope="col" class="px-2 py-2.5 text-right font-medium">Power</th>
								<th scope="col" class="px-2 py-2.5 text-right font-medium">Acc.</th>
								<th scope="col" class="px-4 py-2.5 text-right font-medium">PP</th>
							</tr>
						</thead>
						<tbody class="divide-y">
							{#each byMethod.get(m) ?? [] as move, i (`${move.slug}-${move.level}-${i}`)}
								<tr class="align-top">
									{#if m === "level-up"}
										<td class="px-4 py-2.5 text-muted-foreground tabular">
											{move.level === 0 ? "Evo." : move.level}
										</td>
									{/if}
									<td class="px-4 py-2.5">
										<p class="font-medium">
											<a href="/moves/{move.slug}" class="hover:underline hover:underline-offset-4">{move.name}</a>
											{#if isStab(move)}
												<span class="ml-1 text-xs font-normal text-muted-foreground" title="Same-type attack bonus">STAB</span>
											{/if}
										</p>
										<p class="mt-0.5 line-clamp-2 max-w-md text-xs text-muted-foreground">{move.effect}</p>
									</td>
									<td class="px-2 py-2.5"><TypeBadge type={move.type} size="sm" /></td>
									<td class="px-2 py-2.5"><DamageClassIcon value={move.damageClass} /></td>
									<td class="px-2 py-2.5 text-right tabular">{move.power ?? "—"}</td>
									<td class="px-2 py-2.5 text-right tabular">{move.accuracy === null ? "—" : `${move.accuracy}%`}</td>
									<td class="px-4 py-2.5 text-right tabular">{move.pp ?? "—"}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Tabs.Content>
		{/each}
	</Tabs.Root>
{/if}
