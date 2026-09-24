<script lang="ts">
	import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
	import HeartIcon from "@lucide/svelte/icons/heart";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
	import { page } from "$app/state";
	import { collection } from "$lib/collection/store.svelte.js";
	import type { CollectionFlag } from "$lib/collection/types.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	let { pokemonId, name }: { pokemonId: number; name: string } = $props();

	const state = $derived(collection.get(pokemonId));
	const signedOut = $derived(collection.status === "signed-out");
	const loginHref = $derived(`/login?redirectTo=${encodeURIComponent(page.url.pathname)}`);

	const buttons: { flag: CollectionFlag; on: string; off: string; icon: typeof HeartIcon }[] = [
		{ flag: "caught", on: "Caught", off: "Mark caught", icon: CircleCheckIcon },
		{ flag: "shiny", on: "Shiny caught", off: "Shiny", icon: SparklesIcon },
		{ flag: "favorite", on: "Favorite", off: "Favorite", icon: HeartIcon },
	];
</script>

{#if collection.status === "ready" || signedOut}
	<div class="flex flex-wrap gap-2" role="group" aria-label="Your collection">
		{#each buttons as button (button.flag)}
			{@const active = state[button.flag]}
			{#if signedOut}
				<Button href={loginHref} variant="outline" size="sm" title="Sign in to track {name}">
					<button.icon />
					{button.off}
				</Button>
			{:else}
				<Button
					variant={active ? "default" : "outline"}
					size="sm"
					aria-pressed={active}
					onclick={() => collection.toggle(pokemonId, button.flag)}
				>
					<button.icon class={cn(active && button.flag === "favorite" && "fill-current")} />
					{active ? button.on : button.off}
				</Button>
			{/if}
		{/each}
	</div>
{/if}
