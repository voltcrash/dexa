<script lang="ts">
	import { authClient } from "$lib/auth-client.js";
	import { collection } from "$lib/collection/store.svelte.js";

	const session = authClient.useSession();

	$effect(() => {
		if ($session.isPending) return;
		if ($session.data?.user) collection.load();
		else collection.reset();
	});
</script>
