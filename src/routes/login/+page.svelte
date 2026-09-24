<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { authClient } from "$lib/auth-client.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";

	let { data } = $props();

	let mode = $state<"sign-in" | "sign-up">("sign-in");
	let name = $state("");
	let email = $state("");
	let password = $state("");
	let pending = $state(false);
	let error = $state("");

	async function finish() {
		await invalidateAll();
		await goto(data.redirectTo);
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = "";
		pending = true;
		const result =
			mode === "sign-in"
				? await authClient.signIn.email({ email, password })
				: await authClient.signUp.email({ email, password, name: name.trim() || email.split("@")[0] });
		pending = false;
		if (result.error) {
			error = result.error.message ?? "That didn’t work. Check your details and try again.";
			return;
		}
		await finish();
	}

	async function github() {
		pending = true;
		await authClient.signIn.social({ provider: "github", callbackURL: data.redirectTo });
	}
</script>

<svelte:head>
	<title>{mode === "sign-in" ? "Sign in" : "Create an account"} | Dexa</title>
</svelte:head>

<div class="mx-auto max-w-md px-4 py-16 sm:px-6">
	<h1 class="font-display text-3xl font-semibold tracking-tight">
		{mode === "sign-in" ? "Sign in to Dexa" : "Create your Dexa account"}
	</h1>
	<p class="mt-2 text-muted-foreground">Track the Pokémon you’ve caught and keep your teams on every device.</p>

	{#if !data.configured}
		<p class="mt-8 rounded-xl border bg-card p-4 text-sm">
			Accounts aren’t set up on this deployment. Set <code>DATABASE_URL</code> and <code>BETTER_AUTH_SECRET</code> to
			enable them.
		</p>
	{:else}
		<Tabs.Root value={mode} onValueChange={(value) => ((mode = value as typeof mode), (error = ""))} class="mt-8">
			<Tabs.List class="w-full">
				<Tabs.Trigger value="sign-in">Sign in</Tabs.Trigger>
				<Tabs.Trigger value="sign-up">Create account</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

		<form onsubmit={submit} class="mt-6 grid gap-4">
			{#if mode === "sign-up"}
				<div class="grid gap-2">
					<Label for="name">Trainer name</Label>
					<Input id="name" bind:value={name} autocomplete="nickname" placeholder="Ash" />
				</div>
			{/if}
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" bind:value={email} autocomplete="email" required />
			</div>
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					type="password"
					bind:value={password}
					autocomplete={mode === "sign-in" ? "current-password" : "new-password"}
					minlength={8}
					required
				/>
				{#if mode === "sign-up"}
					<p class="text-xs text-muted-foreground">At least 8 characters.</p>
				{/if}
			</div>
			{#if error}
				<p class="text-sm text-destructive" role="alert">{error}</p>
			{/if}
			<Button type="submit" size="lg" disabled={pending}>
				{#if pending}<Spinner />{/if}
				{mode === "sign-in" ? "Sign in" : "Create account"}
			</Button>
		</form>

		{#if data.socialProviders.includes("github")}
			<div class="my-6 flex items-center gap-3 text-xs text-muted-foreground">
				<span class="h-px flex-1 bg-border"></span>
				or
				<span class="h-px flex-1 bg-border"></span>
			</div>
			<Button variant="outline" size="lg" class="w-full" onclick={github} disabled={pending}>
				<svg viewBox="0 0 24 24" aria-hidden="true" class="size-4" fill="currentColor">
					<path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
				</svg>
				Continue with GitHub
			</Button>
		{/if}
	{/if}
</div>
