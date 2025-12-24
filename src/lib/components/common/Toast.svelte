<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fly, fade } from "svelte/transition";
	import CheckCircle from "lucide-svelte/icons/check-circle";
	import AlertCircle from "lucide-svelte/icons/alert-circle";
	import AlertTriangle from "lucide-svelte/icons/alert-triangle";
	import Info from "lucide-svelte/icons/info";
	import X from "lucide-svelte/icons/x";
	import type { Toast } from "$lib/stores/toast.store";
	import { toast } from "$lib/stores/toast.store";

	export let item: Toast;

	let progress = 100;
	let timer: any;
	const interval = 10;

	onMount(() => {
		if (item.duration && item.duration > 0) {
			const step = (interval / item.duration) * 100;
			timer = setInterval(() => {
				progress -= step;
				if (progress <= 0) {
					clearInterval(timer);
				}
			}, interval);
		}
	});

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});
</script>

<div
	class="toast-item {item.type}"
	in:fly={{ y: 20, duration: 300 }}
	out:fade={{ duration: 200 }}
	role="alert"
>
	<div class="icon">
		{#if item.type === "success"}
			<CheckCircle size={20} />
		{:else if item.type === "error"}
			<AlertCircle size={20} />
		{:else if item.type === "warning"}
			<AlertTriangle size={20} />
		{:else}
			<Info size={20} />
		{/if}
	</div>
	<div class="content">
		<p>{item.message}</p>
	</div>
	<button class="close-btn" on:click={() => toast.remove(item.id)}>
		<X size={16} />
	</button>
	{#if item.duration && item.duration > 0}
		<div class="progress-bar" style="width: {progress}%"></div>
	{/if}
</div>

<style>
	.toast-item {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px;
		background: var(--color-glass-dark);
		backdrop-filter: blur(var(--blur-md));
		-webkit-backdrop-filter: blur(var(--blur-md));
		border-radius: var(--radius-md, 12px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		color: white;
		width: 350px;
		position: relative;
		overflow: hidden;
		margin-bottom: 10px;
		pointer-events: auto;
	}

	.toast-item.success .icon {
		color: var(--color-primary-500);
	}
	.toast-item.error .icon {
		color: #ef4444;
	}
	.toast-item.warning .icon {
		color: #f59e0b;
	}
	.toast-item.info .icon {
		color: #3b82f6;
	}

	.content {
		flex: 1;
		font-size: 0.9rem;
		line-height: 1.4;
		margin-top: 2px;
	}

	.icon {
		display: flex;
		align-items: center;
		margin-top: 2px;
	}

	.close-btn {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.8);
		cursor: pointer;
		padding: 0;
		transition: color 0.2s;
		margin-top: 2px;
	}

	.close-btn:hover {
		color: white;
	}

	.progress-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 3px;
		background: rgba(255, 255, 255, 0.2);
		transition: width 0.1s linear;
	}
</style>
