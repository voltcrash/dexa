<script lang="ts">
	import LinkIcon from "@lucide/svelte/icons/link";
	import { onMount, untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import { replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import PokemonPicker from "$lib/components/pokemon/pokemon-picker.svelte";
	import TypeBadge from "$lib/components/pokemon/type-badge.svelte";
	import DefenseTable from "$lib/components/team/defense-table.svelte";
	import SavedTeams from "$lib/components/team/saved-teams.svelte";
	import TeamSlot from "$lib/components/team/team-slot.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { loadDexList } from "$lib/dex/client.js";
	import type { DexListEntry } from "$lib/dex/list.js";
	import { STAT_KEYS, STAT_LABELS } from "$lib/pokemon/types.js";
	import { MAX_BASE_STAT } from "$lib/pokemon/stats.js";
	import {
		TEAM_SIZE,
		averageStats,
		parseTeam,
		sharedWeaknesses,
		teamDefense,
		teamOffense,
		type TeamMember,
	} from "$lib/team/analysis.js";
	import type { SavedTeam } from "$lib/team/saved.js";

	let { data } = $props();

	let team = $derived<TeamMember[]>([...data.members]);
	let pickerOpen = $state(false);
	let savedId = $state<string | null>(page.url.searchParams.get("t"));
	let dex = $state<Map<string, DexListEntry>>(new Map());

	const defense = $derived(teamDefense(team));
	const weaknesses = $derived(sharedWeaknesses(defense));
	const offense = $derived(teamOffense(team));
	const uncovered = $derived(offense.filter((o) => o.hitters.length === 0).map((o) => o.defend));
	const averages = $derived(averageStats(team));
	const slots = $derived(Array.from({ length: TEAM_SIZE }, (_, i) => team[i]));

	const STORAGE_KEY = "dexa:team";

	function toMember({ id, slug, name, speciesId, types, stats }: DexListEntry): TeamMember {
		return { id, slug, name, speciesId, types, stats };
	}

	// Without ?p, pick up the team last edited on this device; ?add= appends one Pokémon.
	onMount(async () => {
		loadDexList().then((list) => (dex = new Map(list.map((e) => [e.slug, e]))));
		const params = page.url.searchParams;
		const add = params.get("add");
		if (params.has("p") && !add) return;
		let slugs = params.has("p") ? team.map((m) => m.slug) : [];
		if (!params.has("p")) {
			try {
				slugs = parseTeam(localStorage.getItem(STORAGE_KEY));
			} catch {
				slugs = [];
			}
		}
		if (add && !slugs.includes(add) && slugs.length < TEAM_SIZE) slugs.push(add);
		if (!slugs.length) return;
		const bySlug = new Map((await loadDexList()).map((e) => [e.slug, e]));
		sync(slugs.flatMap((slug) => (bySlug.has(slug) ? [toMember(bySlug.get(slug)!)] : [])));
		if (add && slugs.length >= TEAM_SIZE && !slugs.includes(add)) toast.error("Your team already has six Pokémon.");
	});

	function sync(next: TeamMember[]) {
		team = next;
		try {
			localStorage.setItem(STORAGE_KEY, next.map((m) => m.slug).join(","));
		} catch {
			// Storage can be unavailable in private windows; the URL still holds the team.
		}
		if (next.length === 0) savedId = null;
		writeUrl();
	}

	function writeUrl() {
		const params = new URLSearchParams();
		if (team.length) params.set("p", team.map((m) => m.slug).join(","));
		if (savedId) params.set("t", savedId);
		const search = params.toString().replaceAll("%2C", ",");
		replaceState(search ? `?${search}` : page.url.pathname, page.state);
	}

	// Saving or deleting a team changes savedId from the child; mirror it into the URL.
	let lastSavedId = untrack(() => savedId);
	$effect(() => {
		if (savedId === lastSavedId) return;
		lastSavedId = savedId;
		untrack(writeUrl);
	});

	function openSaved(saved: SavedTeam) {
		savedId = saved.id;
		sync(saved.members.flatMap((slug) => (dex.has(slug) ? [toMember(dex.get(slug)!)] : [])));
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	function add(entry: DexListEntry) {
		if (team.length >= TEAM_SIZE) return;
		sync([...team, toMember(entry)]);
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(page.url.href);
			toast.success("Link copied. Anyone with it sees this team.");
		} catch {
			toast.error("Couldn’t copy the link. Copy it from the address bar instead.");
		}
	}
</script>

<svelte:head>
	<title>Team builder | Dexa</title>
	<meta name="description" content="Build a team of six and see its shared weaknesses, resistances and type coverage." />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Team builder</h1>
			<p class="mt-3 max-w-prose text-muted-foreground">
				Pick up to six Pokémon. Dexa checks which attacks your team struggles against and which types it can hit hard.
			</p>
		</div>
		{#if team.length}
			<div class="flex gap-2">
				<Button variant="outline" onclick={copyLink}>
					<LinkIcon />
					Copy link
				</Button>
				<Button variant="ghost" onclick={() => sync([])}>Clear team</Button>
			</div>
		{/if}
	</div>

	<ul class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
		{#each slots as member, i (member?.slug ?? `empty-${i}`)}
			<li>
				<TeamSlot
					{member}
					index={i}
					onadd={() => (pickerOpen = true)}
					onremove={() => sync(team.filter((_, j) => j !== i))}
				/>
			</li>
		{/each}
	</ul>

	{#if page.data.accountsEnabled}
		<div class="mt-8">
			<SavedTeams {team} bind:savedId idsBySlug={(slug) => dex.get(slug)?.id} onopen={openSaved} />
		</div>
	{/if}

	{#if team.length}
		<div class="mt-14 grid gap-14">
			<section aria-labelledby="summary-title">
				<h2 id="summary-title" class="font-display text-2xl font-semibold tracking-tight">Summary</h2>
				<div class="mt-5 grid gap-6 md:grid-cols-2">
					<div class="rounded-2xl border bg-card p-5">
						<h3 class="font-medium">Shared weaknesses</h3>
						{#if weaknesses.length}
							<p class="mt-1 text-sm text-muted-foreground">
								Two or more members are weak to these, and none resist them.
							</p>
							<div class="mt-3 flex flex-wrap gap-1.5">
								{#each weaknesses as type (type)}
									<TypeBadge {type} />
								{/each}
							</div>
						{:else}
							<p class="mt-1 text-sm text-muted-foreground">No attacking type hits several members without an answer.</p>
						{/if}
					</div>
					<div class="rounded-2xl border bg-card p-5">
						<h3 class="font-medium">Not covered by same-type attacks</h3>
						{#if uncovered.length}
							<p class="mt-1 text-sm text-muted-foreground">
								No member’s own types hit these super effectively. Coverage moves can fill the gap.
							</p>
							<div class="mt-3 flex flex-wrap gap-1.5">
								{#each uncovered as type (type)}
									<TypeBadge {type} />
								{/each}
							</div>
						{:else}
							<p class="mt-1 text-sm text-muted-foreground">Your team’s types hit every type super effectively.</p>
						{/if}
					</div>
				</div>
			</section>

			<section aria-labelledby="defense-title">
				<h2 id="defense-title" class="font-display text-2xl font-semibold tracking-tight">Defensive matchups</h2>
				<p class="mt-1 max-w-prose text-sm text-muted-foreground">
					Damage each member takes from every attacking type. Highlighted rows are shared weaknesses.
				</p>
				<div class="mt-5">
					<DefenseTable {team} rows={defense} />
				</div>
			</section>

			<section aria-labelledby="stats-title">
				<h2 id="stats-title" class="font-display text-2xl font-semibold tracking-tight">Average base stats</h2>
				<dl class="mt-5 grid max-w-3xl gap-2.5">
					{#each STAT_KEYS as key, i (key)}
						<div class="grid grid-cols-[5rem_2.5rem_1fr] items-center gap-3 text-sm">
							<dt class="text-muted-foreground">{STAT_LABELS[key].long}</dt>
							<dd class="text-right font-semibold tabular">{averages[i]}</dd>
							<dd class="h-2.5 overflow-hidden rounded-full bg-muted">
								<div class="h-full rounded-full bg-primary" style:width="{(averages[i] / MAX_BASE_STAT) * 100}%"></div>
							</dd>
						</div>
					{/each}
				</dl>
			</section>
		</div>
	{/if}
</div>

<PokemonPicker bind:open={pickerOpen} title="Add a Pokémon to your team" onpick={add} />
