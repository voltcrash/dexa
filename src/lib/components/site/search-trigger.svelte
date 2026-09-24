<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import { onMount } from "svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Kbd } from "$lib/components/ui/kbd/index.js";
	import { palette } from "./palette-state.svelte.js";

	let modifier = $state("⌘");
	onMount(() => {
		if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) modifier = "Ctrl";
	});
</script>

<Button
	variant="outline"
	size="sm"
	onclick={() => (palette.open = true)}
	class="hidden w-56 justify-start gap-2 text-muted-foreground sm:flex"
>
	<SearchIcon />
	Search Pokémon
	<Kbd class="ml-auto">{modifier} K</Kbd>
</Button>
<Button variant="ghost" size="icon" onclick={() => (palette.open = true)} aria-label="Search" class="sm:hidden">
	<SearchIcon />
</Button>
