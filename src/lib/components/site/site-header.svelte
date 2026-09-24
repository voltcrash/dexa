<script lang="ts">
	import type { Snippet } from "svelte";
	import { page } from "$app/state";
	import { navItems } from "$lib/nav.js";
	import { cn } from "$lib/utils.js";
	import Logo from "./logo.svelte";
	import SearchTrigger from "./search-trigger.svelte";
	import ThemeToggle from "./theme-toggle.svelte";

	let { actions }: { actions?: Snippet } = $props();

	function isActive(href: string) {
		if (href === "/") return page.url.pathname === "/" || page.url.pathname.startsWith("/pokemon");
		return page.url.pathname.startsWith(href);
	}
</script>

<header class="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
	<div class="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
		<a href="/" class="flex items-center gap-2 rounded-md" aria-label="Dexa home">
			<Logo />
			<span class="font-display text-lg font-semibold tracking-tight">dexa</span>
		</a>

		<nav aria-label="Main" class="hidden md:block">
			<ul class="flex items-center gap-1">
				{#each navItems as item (item.href)}
					<li>
						<a
							href={item.href}
							aria-current={isActive(item.href) ? "page" : undefined}
							class={cn(
								"rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
								"aria-[current=page]:bg-secondary aria-[current=page]:font-medium aria-[current=page]:text-foreground",
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
		</div>
	</div>

	<nav aria-label="Main" class="border-t md:hidden">
		<ul class="flex gap-1 overflow-x-auto px-3 py-1.5 [scrollbar-width:none]">
			{#each navItems as item (item.href)}
				<li class="shrink-0">
					<a
						href={item.href}
						aria-current={isActive(item.href) ? "page" : undefined}
						class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground aria-[current=page]:bg-secondary aria-[current=page]:font-medium aria-[current=page]:text-foreground"
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
