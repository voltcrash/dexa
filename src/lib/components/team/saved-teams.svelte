<script lang="ts">
	import SaveIcon from "@lucide/svelte/icons/save";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import { toast } from "svelte-sonner";
	import { page } from "$app/state";
	import { authClient } from "$lib/auth-client.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { optimizedImage } from "$lib/images.js";
	import { artworkUrl } from "$lib/pokemon/sprites.js";
	import type { TeamMember } from "$lib/team/analysis.js";
	import { MAX_TEAM_NAME } from "$lib/team/validate.js";
	import type { SavedTeam } from "$lib/team/saved.js";

	let {
		team,
		savedId = $bindable(null),
		idsBySlug,
		onopen,
	}: {
		team: TeamMember[];
		savedId?: string | null;
		idsBySlug: (slug: string) => number | undefined;
		onopen: (saved: SavedTeam) => void;
	} = $props();

	const session = authClient.useSession();
	const signedIn = $derived(Boolean($session.data?.user));

	let saved = $state<SavedTeam[]>([]);
	let loaded = $state(false);
	let dialogOpen = $state(false);
	let name = $state("");
	let saving = $state(false);
	let pendingDelete = $state<SavedTeam | null>(null);

	const current = $derived(saved.find((t) => t.id === savedId) ?? null);

	$effect(() => {
		if (signedIn && !loaded) load();
	});

	async function load() {
		const response = await fetch("/api/teams");
		if (response.ok) saved = await response.json();
		loaded = true;
	}

	async function errorMessage(response: Response) {
		const body = await response.json().catch(() => null);
		return body?.message ?? "Couldn’t save the team. Try again.";
	}

	function openSaveDialog() {
		name = current?.name ?? "";
		dialogOpen = true;
	}

	async function save(event?: SubmitEvent) {
		event?.preventDefault();
		saving = true;
		const members = team.map((m) => m.slug);
		const response = current
			? await fetch(`/api/teams/${current.id}`, {
					method: "PUT",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(event ? { name, members } : { members }),
				})
			: await fetch("/api/teams", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ name, members }),
				});
		saving = false;
		if (!response.ok) {
			toast.error(await errorMessage(response));
			return;
		}
		const result: SavedTeam = await response.json();
		saved = [result, ...saved.filter((t) => t.id !== result.id)];
		savedId = result.id;
		dialogOpen = false;
		toast.success(`Saved “${result.name}”.`);
	}

	async function remove(target: SavedTeam) {
		const response = await fetch(`/api/teams/${target.id}`, { method: "DELETE" });
		pendingDelete = null;
		if (!response.ok) {
			toast.error("Couldn’t delete the team. Try again.");
			return;
		}
		saved = saved.filter((t) => t.id !== target.id);
		if (savedId === target.id) savedId = null;
		toast.success(`Deleted “${target.name}”.`);
	}
</script>

{#if signedIn}
	<section aria-labelledby="saved-title" class="rounded-2xl border bg-card p-5 sm:p-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h2 id="saved-title" class="font-display text-xl font-semibold">Your teams</h2>
				{#if current}
					<p class="mt-1 text-sm text-muted-foreground">Editing “{current.name}”.</p>
				{/if}
			</div>
			{#if team.length}
				<div class="flex gap-2">
					{#if current}
						<Button variant="outline" onclick={() => save()} disabled={saving}>
							<SaveIcon />
							Save changes
						</Button>
						<Button variant="ghost" onclick={() => ((savedId = null), openSaveDialog())}>Save as new</Button>
					{:else}
						<Button onclick={openSaveDialog}>
							<SaveIcon />
							Save team
						</Button>
					{/if}
				</div>
			{/if}
		</div>

		{#if loaded && saved.length === 0}
			<p class="mt-4 text-sm text-muted-foreground">Teams you save appear here on every device you sign in on.</p>
		{:else}
			<ul class="mt-4 divide-y">
				{#each saved as item (item.id)}
					<li class="flex items-center gap-3 py-3">
						<button type="button" class="flex min-w-0 flex-1 items-center gap-3 text-left" onclick={() => onopen(item)}>
							<span class="flex -space-x-2">
								{#each item.members as slug (slug)}
									{@const id = idsBySlug(slug)}
									{#if id}
										<img
											src={optimizedImage(artworkUrl(id), 96)}
											alt=""
											width="32"
											height="32"
											loading="lazy"
											class="size-8 rounded-full border bg-background object-contain"
										/>
									{/if}
								{/each}
							</span>
							<span class="min-w-0">
								<span class="block truncate font-medium hover:underline {item.id === savedId ? 'text-primary' : ''}">{item.name}</span>
								<span class="block text-xs text-muted-foreground">{item.members.length} Pokémon</span>
							</span>
						</button>
						<Button variant="ghost" size="icon-sm" aria-label="Delete {item.name}" onclick={() => (pendingDelete = item)}>
							<Trash2Icon />
						</Button>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{:else if !$session.isPending}
	<p class="text-sm text-muted-foreground">
		<a href="/login?redirectTo={encodeURIComponent(page.url.pathname + page.url.search)}" class="underline underline-offset-4 hover:text-foreground">Sign in</a>
		to save teams to your account.
	</p>
{/if}

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Save team</Dialog.Title>
			<Dialog.Description>Name this team so you can find it later.</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={save} class="grid gap-4">
			<div class="grid gap-2">
				<Label for="team-name">Team name</Label>
				<Input id="team-name" bind:value={name} maxlength={MAX_TEAM_NAME} required placeholder="Rain team" />
			</div>
			<Dialog.Footer>
				<Button type="submit" disabled={saving || !name.trim()}>Save team</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root open={pendingDelete !== null} onOpenChange={(open) => !open && (pendingDelete = null)}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete “{pendingDelete?.name}”?</AlertDialog.Title>
			<AlertDialog.Description>This removes the saved team from your account. It can’t be undone.</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Keep team</AlertDialog.Cancel>
			<AlertDialog.Action onclick={() => pendingDelete && remove(pendingDelete)}>Delete team</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
