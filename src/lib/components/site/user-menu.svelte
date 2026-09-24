<script lang="ts">
	import LibraryIcon from "@lucide/svelte/icons/library-big";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import { goto, invalidateAll } from "$app/navigation";
	import { authClient } from "$lib/auth-client.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

	const session = authClient.useSession();

	const user = $derived($session.data?.user);
	const initials = $derived(
		(user?.name || user?.email || "?")
			.split(/\s+/)
			.map((part) => part[0])
			.join("")
			.slice(0, 2)
			.toUpperCase(),
	);

	async function signOut() {
		await authClient.signOut();
		await invalidateAll();
		goto("/");
	}
</script>

{#if user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="ghost" size="icon" aria-label="Account menu">
					<Avatar.Root class="size-7">
						{#if user.image}
							<Avatar.Image src={user.image} alt="" />
						{/if}
						<Avatar.Fallback class="text-xs">{initials}</Avatar.Fallback>
					</Avatar.Root>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-56">
			<DropdownMenu.Label class="font-normal">
				<p class="truncate font-medium">{user.name}</p>
				<p class="truncate text-xs text-muted-foreground">{user.email}</p>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onSelect={() => goto("/collection")}>
				<LibraryIcon />
				Your collection
			</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={signOut}>
				<LogOutIcon />
				Sign out
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else if !$session.isPending}
	<Button href="/login" variant="ghost" size="sm">Sign in</Button>
{/if}
