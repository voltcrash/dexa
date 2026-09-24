<script lang="ts">
	import "./layout.css";
	import { ModeWatcher } from "mode-watcher";
	import favicon from "$lib/assets/favicon.svg";
	import CollectionSync from "$lib/components/site/collection-sync.svelte";
	import CommandPalette from "$lib/components/site/command-palette.svelte";
	import SiteFooter from "$lib/components/site/site-footer.svelte";
	import SiteHeader from "$lib/components/site/site-header.svelte";
	import { Toaster } from "$lib/components/ui/sonner/index.js";

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Dexa</title>
	<meta name="description" content="A fast, complete Pokédex: every Pokémon, move, ability and type matchup, plus a team builder and collection tracker." />
</svelte:head>

<ModeWatcher themeColors={{ light: "#f5f6f8", dark: "#0f1528" }} />
<Toaster position="bottom-center" />
<CommandPalette />
{#if data.accountsEnabled}
	<CollectionSync />
{/if}

<a
	href="#main"
	class="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
>
	Skip to content
</a>

<div class="flex min-h-dvh flex-col">
	<SiteHeader accountsEnabled={data.accountsEnabled} />
	<main id="main" class="flex-1">
		{@render children()}
	</main>
	<SiteFooter />
</div>
