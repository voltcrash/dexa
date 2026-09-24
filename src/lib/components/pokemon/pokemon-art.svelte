<script lang="ts">
	import { imageSrcset, optimizedImage, type ImageWidth } from "$lib/images.js";
	import { artworkUrl } from "$lib/pokemon/sprites.js";
	import { cn } from "$lib/utils.js";

	let {
		id,
		name,
		shiny = false,
		width = 256,
		widths = [192, 256, 384],
		sizes = "(min-width: 1024px) 200px, 45vw",
		eager = false,
		class: className,
	}: {
		id: number;
		name: string;
		shiny?: boolean;
		width?: ImageWidth;
		widths?: ImageWidth[];
		sizes?: string;
		eager?: boolean;
		class?: string;
	} = $props();

	let failed = $state(false);
	const url = $derived(artworkUrl(id, shiny));

	$effect(() => {
		void url;
		failed = false;
	});
</script>

{#if failed}
	<div
		class={cn("grid aspect-square place-items-center text-muted-foreground/60", className)}
		role="img"
		aria-label="{name} artwork unavailable"
	>
		<svg viewBox="0 0 24 24" class="size-1/3" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
			<circle cx="12" cy="12" r="9" />
			<path d="M3 12h6m6 0h6" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	</div>
{:else}
	<img
		src={optimizedImage(url, width)}
		srcset={imageSrcset(url, widths)}
		{sizes}
		alt={name}
		width="475"
		height="475"
		loading={eager ? "eager" : "lazy"}
		fetchpriority={eager ? "high" : undefined}
		decoding="async"
		onerror={() => (failed = true)}
		class={cn("aspect-square h-auto w-full object-contain", className)}
	/>
{/if}
