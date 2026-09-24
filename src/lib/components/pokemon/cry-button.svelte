<script lang="ts">
	import Volume2Icon from "@lucide/svelte/icons/volume-2";
	import { toast } from "svelte-sonner";
	import { Button } from "$lib/components/ui/button/index.js";

	let { url, name }: { url: string | null; name: string } = $props();

	let playing = $state(false);

	async function play() {
		if (!url || playing) return;
		const audio = new Audio(url);
		audio.volume = 0.6;
		playing = true;
		audio.addEventListener("ended", () => (playing = false), { once: true });
		try {
			await audio.play();
		} catch {
			playing = false;
			toast.error("This browser can’t play Pokémon cries. They use Ogg audio, which some versions of Safari don’t support.");
		}
	}
</script>

{#if url}
	<Button variant="secondary" size="sm" onclick={play} aria-label="Play {name}’s cry">
		<Volume2Icon class={playing ? "animate-pulse" : ""} />
		Cry
	</Button>
{/if}
