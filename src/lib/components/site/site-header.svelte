<script lang="ts">
	import type { Snippet } from "svelte";
	import { page } from "$app/state";
	import { navItems } from "$lib/nav.js";
	import { cn } from "$lib/utils.js";
	import Logo from "./logo.svelte";
	import SearchTrigger from "./search-trigger.svelte";
	import ThemeToggle from "./theme-toggle.svelte";
	import UserMenu from "./user-menu.svelte";

	let { actions, accountsEnabled = false }: { actions?: Snippet; accountsEnabled?: boolean } = $props();

	function isActive(href: string) {
		if (href === "/") return page.url.pathname === "/" || page.url.pathname.startsWith("/pokemon");
		return page.url.pathname.startsWith(href);
	}
</script>

<header class="sticky top-0 z-40 border-b bg-card">
	<div class="mx-auto flex h-14 max-w-7xl items-center gap-8 px-4 sm:px-6">
		<a href="/" class="flex items-center gap-2 rounded-md" aria-label="Dexa home">
			<Logo class="size-6" />
			<span class="font-display text-lg font-bold tracking-tight">dexa</span>
		</a>

		<nav aria-label="Main" class="hidden self-stretch lg:block">
			<ul class="flex h-full items-stretch gap-5">
				{#each navItems as item (item.href)}
					<li>
						<a
							href={item.href}
							aria-current={isActive(item.href) ? "page" : undefined}
							class={cn(
								"flex h-full items-center border-y-2 border-transparent text-sm text-muted-foreground transition-colors hover:text-foreground",
								"aria-[current=page]:border-b-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground",
							)}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="ml-auto flex items-center gap-1">
			<SearchTrigger />
			{@render actions?.()}
			<ThemeToggle />
			{#if accountsEnabled}
				<UserMenu />
			{/if}
		</div>
	</div>

	<nav aria-label="Main" class="border-t lg:hidden">
		<ul class="flex gap-5 overflow-x-auto px-4 [scrollbar-width:none]">
			{#each navItems as item (item.href)}
				<li class="shrink-0">
					<a
						href={item.href}
						aria-current={isActive(item.href) ? "page" : undefined}
						class="block border-y-2 border-transparent py-2 text-sm text-muted-foreground aria-[current=page]:border-b-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground"
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
