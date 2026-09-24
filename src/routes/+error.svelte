<script lang="ts">
	import { page } from "$app/state";
	import { Button } from "$lib/components/ui/button/index.js";

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? "Not found" : "Something went wrong"} | Dexa</title>
</svelte:head>

<div class="mx-auto flex max-w-2xl flex-col items-start px-4 py-24 sm:px-6">
	<p class="font-display text-6xl font-semibold text-muted-foreground/50 tabular">{page.status}</p>
	<h1 class="mt-4 font-display text-3xl font-semibold tracking-tight">
		{notFound ? "This page isn’t in the Pokédex" : "Something went wrong"}
	</h1>
	<p class="mt-3 text-muted-foreground">
		{#if notFound}
			{page.error?.message ?? "Check the address, or search for the Pokémon you’re after."}
		{:else}
			{page.error?.message ?? "PokéAPI may be unavailable. Try again in a moment."}
		{/if}
	</p>
	<Button href="/" class="mt-8">Browse the Pokédex</Button>
</div>
