<script lang="ts">
	import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { Button } from "$lib/components/ui/button/index.js";
	import type { FlavorEntry } from "$lib/pokemon/detail.js";

	let { entries }: { entries: FlavorEntry[] } = $props();

	let index = $state(0);
	const current = $derived(entries[index] ?? entries[0]);

	$effect(() => {
		void entries;
		index = 0;
	});
</script>

{#if current}
	<figure class="grid gap-2">
		<blockquote class="max-w-prose text-lg leading-relaxed text-pretty">{current.text}</blockquote>
		<figcaption class="flex items-center gap-2 text-sm text-muted-foreground">
			<span>{current.versions.join(", ")}</span>
			{#if entries.length > 1}
				<span class="ml-auto flex items-center gap-1 tabular">
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Previous entry"
						disabled={index === 0}
						onclick={() => index--}
					>
						<ChevronLeftIcon />
					</Button>
					{index + 1} of {entries.length}
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Next entry"
						disabled={index === entries.length - 1}
						onclick={() => index++}
					>
						<ChevronRightIcon />
					</Button>
				</span>
			{/if}
		</figcaption>
	</figure>
{/if}
