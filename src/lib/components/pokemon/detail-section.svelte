<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		id,
		title,
		description,
		actions,
		children,
	}: { id: string; title: string; description?: string; actions?: Snippet; children: Snippet } =
		$props();
</script>

<section {id} aria-labelledby="{id}-title" class="scroll-mt-36">
	<div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
		<div>
			<h2 id="{id}-title" class="section-title">{title}</h2>
			{#if description}
				<p class="mt-1 max-w-prose text-sm text-muted-foreground">{description}</p>
			{/if}
		</div>
		{@render actions?.()}
	</div>
	<div class="mt-5">
		{@render children()}
	</div>
</section>
