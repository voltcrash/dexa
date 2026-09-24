<script lang="ts">
	import ArrowDownWideNarrowIcon from "@lucide/svelte/icons/arrow-down-wide-narrow";
	import ArrowUpNarrowWideIcon from "@lucide/svelte/icons/arrow-up-narrow-wide";
	import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
	import { SORT_KEYS, TAGS, TAG_LABELS, type DexQuery, type SortKey, type Tag } from "$lib/dex/list.js";
	import { GENERATIONS } from "$lib/pokemon/generations.js";
	import { STAT_LABELS, type StatKey } from "$lib/pokemon/types.js";

	let { query, onchange }: { query: DexQuery; onchange: (next: Partial<DexQuery>) => void } =
		$props();

	const sortLabels: Record<SortKey, string> = {
		dex: "Dex number",
		name: "Name",
		total: "Base stat total",
		...(Object.fromEntries(
			Object.entries(STAT_LABELS).map(([key, label]) => [key, label.long]),
		) as Record<StatKey, string>),
	};

	const extraCount = $derived(query.tags.length + (query.forms ? 1 : 0));

	function toggleTag(tag: Tag, on: boolean) {
		onchange({ tags: on ? [...query.tags, tag] : query.tags.filter((t) => t !== tag) });
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	<div class="-mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:w-auto sm:px-0">
	<ToggleGroup.Root
		type="multiple"
		variant="outline"
		size="sm"
		aria-label="Filter by generation"
		value={query.gens.map(String)}
		onValueChange={(value) => onchange({ gens: value.map(Number) })}
	>
		{#each GENERATIONS as gen (gen.id)}
			<ToggleGroup.Item value={String(gen.id)} title="Generation {gen.numeral}: {gen.region}" aria-label="Generation {gen.numeral}, {gen.region}" class="min-w-9 tabular">
				{gen.numeral}
			</ToggleGroup.Item>
		{/each}
	</ToggleGroup.Root>
	</div>

	<div class="ml-auto flex items-center gap-2">
		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" size="sm">
						<SlidersHorizontalIcon />
						More filters
						{#if extraCount}
							<span class="rounded-full bg-primary px-1.5 text-[0.6875rem] text-primary-foreground tabular">{extraCount}</span>
						{/if}
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content align="end" class="w-64">
				<div class="grid gap-3">
					{#each TAGS as tag (tag)}
						<div class="flex items-center justify-between gap-4">
							<Label for="tag-{tag}">{TAG_LABELS[tag]}</Label>
							<Switch
								id="tag-{tag}"
								checked={query.tags.includes(tag)}
								onCheckedChange={(on) => toggleTag(tag, on)}
							/>
						</div>
					{/each}
					<div class="flex items-center justify-between gap-4 border-t pt-3">
						<Label for="show-forms">Alternate forms</Label>
						<Switch id="show-forms" checked={query.forms} onCheckedChange={(forms) => onchange({ forms })} />
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>

		<Select.Root type="single" value={query.sort} onValueChange={(sort) => onchange({ sort: sort as SortKey })}>
			<Select.Trigger size="sm" class="w-44" aria-label="Sort by">
				Sort: {sortLabels[query.sort]}
			</Select.Trigger>
			<Select.Content align="end">
				{#each SORT_KEYS as key (key)}
					<Select.Item value={key} label={sortLabels[key]} />
				{/each}
			</Select.Content>
		</Select.Root>

		<Button
			variant="outline"
			size="icon-sm"
			onclick={() => onchange({ desc: !query.desc })}
			aria-label={query.desc ? "Sort ascending" : "Sort descending"}
			title={query.desc ? "Descending" : "Ascending"}
		>
			{#if query.desc}
				<ArrowDownWideNarrowIcon />
			{:else}
				<ArrowUpNarrowWideIcon />
			{/if}
		</Button>
	</div>
</div>
