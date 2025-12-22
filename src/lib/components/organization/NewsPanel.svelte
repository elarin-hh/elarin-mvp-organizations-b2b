<script lang="ts">
	interface NewsItem {
		title: string;
		summary: string;
		sourceLabel: string;
		sourceUrl: string;
		tag?: string;
	}

	interface Props {
		items: NewsItem[];
	}

	let { items }: Props = $props();
</script>

<div class="glass-card w-full p-6">
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-bold text-white">Painel de notícias</h3>
		<span class="text-xs text-white/40">Fontes externas</span>
	</div>

	<div class="space-y-4">
		{#each items as item}
			<article class="news-item">
				<div class="flex items-center justify-between gap-4">
					<h4 class="text-sm sm:text-base font-semibold text-white">
						{item.title}
					</h4>
					{#if item.tag}
						<span class="news-tag">{item.tag}</span>
					{/if}
				</div>
				<p class="text-sm text-white/60 mt-2">{item.summary}</p>
				<a
					class="news-source"
					href={item.sourceUrl}
					target="_blank"
					rel="noreferrer"
				>
					Fonte: {item.sourceLabel}
				</a>
			</article>
		{/each}
	</div>
</div>

<style>
	.news-item {
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border-light);
	}

	.news-item:first-child {
		padding-top: 0;
	}

	.news-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.news-tag {
		display: inline-flex;
		align-items: center;
		padding: 0.15rem 0.5rem;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		background: var(--color-glass-light-weak);
		border: 1px solid var(--color-border-light);
	}

	.news-source {
		display: inline-flex;
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: var(--color-primary-300);
	}

	.news-source:hover {
		color: var(--color-primary-200);
	}
</style>
