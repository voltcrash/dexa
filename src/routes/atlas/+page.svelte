<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import AtlasChart from "#lib/components/atlas/atlas-chart.svelte";
	import SearchFilters from "#lib/components/dex/search-filters.svelte";
	import SearchTips from "#lib/components/dex/search-tips.svelte";
	import { Input } from "#lib/components/ui/input/index.js";
	import { Label } from "#lib/components/ui/label/index.js";
	import * as Select from "#lib/components/ui/select/index.js";
	import { Switch } from "#lib/components/ui/switch/index.js";
	import * as ToggleGroup from "#lib/components/ui/toggle-group/index.js";
	import { AXES, AXIS_LABELS, PRESETS, type Axis } from "#lib/dex/atlas.js";
	import { loadDexList } from "#lib/dex/client.js";
	import { DEFAULT_QUERY, queryDex, type DexListEntry } from "#lib/dex/list.js";
	import { STAT_KEYS } from "#lib/pokemon/types.js";

	let { data } = $props();

	let x = $derived<Axis>(data.x);
	let y = $derived<Axis>(data.y);
	let q = $derived(data.q);
	let forms = $derived(data.forms);
	let all = $state<DexListEntry[] | null>(null);

	onMount(() => {
		loadDexList().then((entries) => (all = entries));
	});

	const plotted = $derived(all ? all.filter((e) => forms || e.isDefault) : []);
	const matches = $derived.by(() => {
		if (!all || !q.trim()) return null;
		return new Set(queryDex(plotted, { ...DEFAULT_QUERY, q, forms: true }).map((e) => e.id));
	});
	const preset = $derived(PRESETS.find((p) => p.x === x && p.y === y)?.label ?? "");
	const count = new Intl.NumberFormat("en");

	const dexLink = $derived.by(() => {
		const params = new URLSearchParams();
		if (q.trim()) params.set("q", q.trim());
		const sort = (STAT_KEYS as readonly string[]).includes(y) || y === "total" ? y : null;
		if (sort) params.set("sort", sort);
		if (sort) params.set("dir", "desc");
		return `/?${params}`;
	});

	function sync() {
		const params = new URLSearchParams();
		if (x !== "attack" || y !== "special-attack") {
			params.set("x", x);
			params.set("y", y);
		}
		if (q.trim()) params.set("q", q.trim());
		if (forms) params.set("forms", "1");
		const search = params.toString();
		goto(search ? `?${search}` : page.url.pathname, { shallow: true, replace: true, state: page.state });
	}

	function setAxes(nextX: Axis, nextY: Axis) {
		[x, y] = [nextX, nextY];
		sync();
	}
</script>

<svelte:head>
	<title>Atlas | Dexa</title>
	<meta name="description" content="Every Pokémon plotted by any two stats, height or weight. Search to highlight groups and see where they sit." />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6">
	<h1 class="page-title">Atlas</h1>
	<p class="mt-2 max-w-prose text-muted-foreground">
		Every Pokémon plotted by two measures. Search to highlight a group and see where it sits; hover a point to identify it, click to open it.
	</p>

	<div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
		<ToggleGroup.Root
			type="single"
			variant="outline"
			size="sm"
			value={preset}
			onValueChange={(label) => {
				const next = PRESETS.find((p) => p.label === label);
				if (next) setAxes(next.x, next.y);
			}}
			aria-label="Views"
			class="flex-wrap"
		>
			{#each PRESETS as p (p.label)}
				<ToggleGroup.Item value={p.label}>{p.label}</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>

		<div class="flex items-center gap-2">
			{#each [{ axis: "x", value: x, label: "Across" }, { axis: "y", value: y, label: "Up" }] as control (control.axis)}
				<Select.Root
					type="single"
					value={control.value}
					onValueChange={(value) => (control.axis === "x" ? setAxes(value as Axis, y) : setAxes(x, value as Axis))}
				>
					<Select.Trigger size="sm" class="w-44" aria-label="{control.label} axis">
						<span class="text-muted-foreground">{control.label}:</span>
						{AXIS_LABELS[control.value]}
					</Select.Trigger>
					<Select.Content>
						{#each AXES as axis (axis)}
							<Select.Item value={axis} label={AXIS_LABELS[axis]} />
						{/each}
					</Select.Content>
				</Select.Root>
			{/each}
		</div>

		<div class="flex items-center gap-2 lg:ml-auto">
			<Switch
				id="atlas-forms"
				checked={forms}
				onCheckedChange={(checked) => {
					forms = checked;
					sync();
				}}
			/>
			<Label for="atlas-forms">Alternate forms</Label>
		</div>
	</div>

	<div class="relative mt-4">
		<SearchIcon class="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="search"
			value={q}
			oninput={(event) => {
				q = event.currentTarget.value;
				sync();
			}}
			placeholder="Highlight with a name or filters like type:dragon or role:wall"
			aria-label="Highlight Pokémon"
			autocomplete="off"
			spellcheck={false}
			class="h-11 rounded-lg bg-card pl-11 text-base md:text-base"
		/>
	</div>
	<div class="mt-2 flex items-start gap-2">
		<div class="min-w-0 flex-1">
			<SearchFilters {q} onchange={(next) => ((q = next), sync())} />
		</div>
		<SearchTips onpick={(example) => ((q = `${q.trim()} ${example}`.trim()), sync())} />
	</div>

	<section aria-label="Atlas" class="mt-2 rounded-lg border bg-card p-3 sm:p-5">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
			<p class="text-muted-foreground tabular" aria-live="polite">
				{#if !all}
					Loading every Pokémon…
				{:else if matches}
					<span class="font-medium text-foreground">{count.format(matches.size)}</span> of {count.format(plotted.length)} highlighted
				{:else}
					{count.format(plotted.length)} Pokémon
				{/if}
			</p>
			<a href={dexLink} class="text-muted-foreground underline underline-offset-4 hover:text-foreground">
				{matches ? "List these in the Pokédex" : "See them as a table"}
			</a>
		</div>
		{#if all}
			<AtlasChart entries={plotted} {x} {y} {matches} onopen={(entry) => goto(`/pokemon/${entry.slug}`)} />
		{:else}
			<div class="h-[340px] animate-pulse rounded-md bg-muted/50 sm:h-[560px]"></div>
		{/if}
	</section>
</div>
