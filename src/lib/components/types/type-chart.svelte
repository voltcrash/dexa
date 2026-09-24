<script lang="ts">
	import { formatMultiplier, typeMultiplier } from "$lib/pokemon/matchups.js";
	import { titleCase } from "$lib/pokemon/format.js";
	import { TYPES, typeTextClass, type TypeName } from "$lib/pokemon/types.js";
	import { cn } from "$lib/utils.js";

	let {
		highlightDefenders = [],
		onpick,
	}: { highlightDefenders?: TypeName[]; onpick?: (type: TypeName) => void } = $props();

	let hover = $state<{ attack: TypeName; defend: TypeName } | null>(null);

	const abbr = (type: TypeName) => titleCase(type).slice(0, 3);

	function cellClass(m: number) {
		if (m === 2) return "bg-[#2f9e5b] text-white font-semibold";
		if (m === 0.5) return "bg-[#f3d4cf] text-[#9b2c1c] dark:bg-[#4b2320] dark:text-[#ffb3a6]";
		if (m === 0) return "bg-foreground text-background font-semibold";
		return "text-transparent";
	}
</script>

<div class="overflow-x-auto rounded-2xl border bg-card p-3">
	<table class="mx-auto border-separate border-spacing-0.5 text-xs" onmouseleave={() => (hover = null)}>
		<caption class="sr-only">Damage multiplier of each attacking type (rows) against each defending type (columns)</caption>
		<thead>
			<tr>
				<th scope="col" class="p-1 text-left align-bottom font-normal text-muted-foreground">
					<span class="block">Defending →</span>
					<span class="block">Attacking ↓</span>
				</th>
				{#each TYPES as defend (defend)}
					<th scope="col" class="p-0">
						<button
							type="button"
							onclick={() => onpick?.(defend)}
							aria-pressed={highlightDefenders.includes(defend)}
							title="Use {titleCase(defend)} as a defending type"
							style:background-color="var(--type-{defend})"
							class={cn(
								"grid h-9 w-9 place-items-center rounded-md text-[0.625rem] font-semibold transition-opacity",
								typeTextClass(defend),
								hover && hover.defend !== defend && "opacity-50",
								highlightDefenders.includes(defend) && "ring-2 ring-foreground ring-offset-2 ring-offset-card",
							)}
						>
							<span aria-hidden="true">{abbr(defend)}</span>
							<span class="sr-only">{titleCase(defend)}</span>
						</button>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each TYPES as attack (attack)}
				<tr>
					<th scope="row" class="p-0 pr-1">
						<span
							style:background-color="var(--type-{attack})"
							class={cn(
								"flex h-9 w-20 items-center rounded-md px-2 text-[0.6875rem] font-semibold transition-opacity",
								typeTextClass(attack),
								hover && hover.attack !== attack && "opacity-50",
							)}
						>
							{titleCase(attack)}
						</span>
					</th>
					{#each TYPES as defend (defend)}
						{@const m = typeMultiplier(attack, defend)}
						<td
							onmouseenter={() => (hover = { attack, defend })}
							class={cn(
								"h-9 w-9 rounded-md text-center tabular",
								cellClass(m),
								m === 1 && "bg-muted/60",
								hover && (hover.attack === attack || hover.defend === defend) && "outline-2 outline-foreground/30",
							)}
						>
							{#if m !== 1}
								{formatMultiplier(m).replace("×", "")}
							{/if}
							<span class="sr-only">{titleCase(attack)} against {titleCase(defend)}: {formatMultiplier(m)}</span>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
