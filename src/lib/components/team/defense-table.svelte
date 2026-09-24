<script lang="ts">
	import { defensiveProfile, formatMultiplier } from "$lib/pokemon/matchups.js";
	import { titleCase } from "$lib/pokemon/format.js";
	import { typeTextClass } from "$lib/pokemon/types.js";
	import type { DefenseRow, TeamMember } from "$lib/team/analysis.js";
	import { cn } from "$lib/utils.js";

	let { team, rows }: { team: TeamMember[]; rows: DefenseRow[] } = $props();

	const profiles = $derived(team.map((m) => defensiveProfile(m.types)));

	function cell(m: number) {
		if (m === 0) return "bg-foreground text-background";
		if (m >= 4) return "bg-[#c8102e] text-white";
		if (m >= 2) return "bg-[#f3d4cf] text-[#9b2c1c] dark:bg-[#4b2320] dark:text-[#ffb3a6]";
		if (m <= 0.25) return "bg-[#1f7a45] text-white";
		if (m < 1) return "bg-[#d3eedd] text-[#1f6b3d] dark:bg-[#173b28] dark:text-[#9be0b5]";
		return "text-muted-foreground/40";
	}
</script>

<div class="overflow-x-auto rounded-2xl border bg-card">
	<table class="w-full min-w-[36rem] text-sm">
		<caption class="sr-only">Damage each team member takes from each attacking type</caption>
		<thead class="border-b text-xs text-muted-foreground">
			<tr>
				<th scope="col" class="px-3 py-2.5 text-left font-medium">Attack</th>
				{#each team as member (member.slug)}
					<th scope="col" class="max-w-20 truncate px-1 py-2.5 text-center font-medium">{member.name}</th>
				{/each}
				<th scope="col" class="px-2 py-2.5 text-center font-medium">Weak</th>
				<th scope="col" class="px-3 py-2.5 text-center font-medium">Resist</th>
			</tr>
		</thead>
		<tbody class="divide-y">
			{#each rows as row (row.attack)}
				{@const danger = row.weak >= 2 && row.resist + row.immune === 0}
				<tr class={cn(danger && "bg-[#c8102e]/6")}>
					<th scope="row" class="px-3 py-1.5 text-left">
						<span
							class={cn("inline-flex h-6 w-20 items-center rounded-full px-2.5 text-xs font-medium", typeTextClass(row.attack))}
							style:background-color="var(--type-{row.attack})"
						>
							{titleCase(row.attack)}
						</span>
					</th>
					{#each profiles as profile, i (team[i].slug)}
						{@const m = profile[row.attack]}
						<td class="px-1 py-1.5 text-center">
							<span class={cn("inline-grid h-6 min-w-9 place-items-center rounded-md px-1 text-xs font-medium tabular", cell(m))}>
								{m === 1 ? "·" : formatMultiplier(m)}
							</span>
						</td>
					{/each}
					<td class={cn("px-2 py-1.5 text-center font-medium tabular", danger && "text-destructive")}>{row.weak || ""}</td>
					<td class="px-3 py-1.5 text-center tabular text-muted-foreground">{row.resist + row.immune || ""}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
