<script lang="ts">
	interface Props {
		title: string;
		value: number;
		variant?: "default" | "success" | "muted";
		icon?: import("svelte").Snippet;
	}

	let { title, value, variant = "default", icon }: Props = $props();
</script>

<div
	class="p-6"
	style="background-color: var(--color-bg-dark-secondary); border-radius: var(--radius-standard);"
>
	<div class="flex items-center justify-between">
		<div class="flex-1">
			<p class="text-sm font-medium text-white/60 mb-3">{title}</p>
			<p class="text-4xl font-bold text-white tabular-nums">{value}</p>
		</div>
		{#if icon}
			<div
				class="ml-4 p-3 bg-white/5"
				style="border-radius: var(--radius-standard);"
			>
				{@render icon()}
			</div>
		{/if}
	</div>
</div>
