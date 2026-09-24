<script lang="ts">
	import type { DexListEntry } from "$lib/dex/list.js";
	import { cn } from "$lib/utils.js";
	import PokemonArt from "./pokemon-art.svelte";
	import TypeBadge from "./type-badge.svelte";

	let { forms, currentId }: { forms: DexListEntry[]; currentId: number } = $props();
</script>

<ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
	{#each forms as form (form.id)}
		{@const current = form.id === currentId}
		<li>
			<a
				href="/pokemon/{form.slug}"
				aria-current={current ? "page" : undefined}
				style:--tint="var(--type-{form.types[0]})"
				class={cn(
					"group flex h-full flex-col gap-2 rounded-2xl border p-3 transition-colors hover:border-(--tint)",
					current && "border-(--tint) bg-card",
				)}
			>
				<div class="tint-field rounded-xl p-2">
					<PokemonArt id={form.id} name={form.name} width={192} widths={[192, 256]} sizes="160px" />
				</div>
				<p class="text-sm leading-snug font-medium">{form.form ?? "Default"}</p>
				<div class="mt-auto flex flex-wrap gap-1">
					{#each form.types as type (type)}
						<TypeBadge {type} size="sm" />
					{/each}
				</div>
			</a>
		</li>
	{/each}
</ul>
