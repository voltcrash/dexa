<script lang="ts">
	import MoonIcon from "@lucide/svelte/icons/moon";
	import SunIcon from "@lucide/svelte/icons/sun";
	import { mode, toggleMode } from "mode-watcher";
	import { Button } from "$lib/components/ui/button/index.js";

	const label = $derived(mode.current === "dark" ? "Use light theme" : "Use dark theme");
</script>

<Button variant="ghost" size="icon" onclick={toggleMode} aria-label={label} title={label}>
	<SunIcon class="hidden dark:block" />
	<MoonIcon class="dark:hidden" />
</Button>
