<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { SEARCH_EXAMPLES } from "$lib/dex/filters.js";

	let { onpick }: { onpick: (query: string) => void } = $props();

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="sm" class="h-7 px-2 text-muted-foreground">Search tips</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content align="end" class="w-[min(28rem,calc(100vw-2rem))] p-0">
		<p class="border-b px-4 py-3 text-sm text-muted-foreground">
			Mix filters with a name. Every filter must match. Pick one to add it.
		</p>
		<ul class="py-1">
			{#each SEARCH_EXAMPLES as example (example.query)}
				<li>
					<button
						type="button"
						onclick={() => {
							onpick(example.query);
							open = false;
						}}
						class="grid w-full grid-cols-[8.5rem_minmax(0,1fr)] items-baseline gap-3 px-4 py-1.5 text-left text-sm hover:bg-muted"
					>
						<code class="font-medium">{example.query}</code>
						<span class="text-muted-foreground">{example.description}</span>
					</button>
				</li>
			{/each}
		</ul>
	</Popover.Content>
</Popover.Root>
