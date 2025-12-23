<script lang="ts">
	import { goto } from "$app/navigation";
	import type { PageData } from "./$types";
	import { organizationsApi } from "$lib/api/organizations.api";
	import Button from "$lib/components/common/Button.svelte";
	import Modal from "$lib/components/common/Modal.svelte";
	import type { TrainingPlan } from "$lib/types/training-plan";

	let { data }: { data: PageData } = $props();

	let plans = $state<TrainingPlan[]>(data.plans ?? []);
	let errorMessage = $state(data.errorMessage ?? "");
	let showCreateModal = $state(false);
	let createName = $state("");
	let createDescription = $state("");
	let isSubmitting = $state(false);
	let formError = $state("");

	$effect(() => {
		plans = data.plans ?? [];
		errorMessage = data.errorMessage ?? "";
	});

	async function handleCreatePlan() {
		if (!createName.trim()) {
			formError = "Informe o nome do plano.";
			return;
		}
		formError = "";
		isSubmitting = true;

		const response = await organizationsApi.createTrainingPlan({
			name: createName.trim(),
			description: createDescription.trim() || null
		});

		if (response.success) {
			plans = [response.data, ...plans];
			createName = "";
			createDescription = "";
			showCreateModal = false;
		} else {
			formError = response.error?.message || "Erro ao criar plano.";
		}

		isSubmitting = false;
	}

	async function handleDeactivate(plan: TrainingPlan) {
		if (!plan.is_active) return;
		if (!confirm("Deseja desativar este plano?")) return;

		const response = await organizationsApi.deleteTrainingPlan(plan.id);
		if (response.success) {
			plans = plans.map((item) =>
				item.id === plan.id ? { ...item, is_active: false } : item
			);
		} else {
			alert(response.error?.message || "Erro ao desativar plano.");
		}
	}
</script>

<div class="min-h-full">
	<main class="w-full min-h-full px-6 pt-8 pb-8">
		<div class="flex items-start justify-between gap-4 mb-6">
			<div>
				<h1 class="text-2xl font-bold text-white">Planos de treino</h1>
				<p class="text-white/50 text-sm mt-1">
					Crie e gerencie planos para seus usuarios.
				</p>
			</div>
			<Button class="btn-radius-md" onclick={() => (showCreateModal = true)}>
				{#snippet children()}Criar plano{/snippet}
			</Button>
		</div>

		{#if errorMessage}
			<div class="error-banner">{errorMessage}</div>
		{/if}

		{#if plans.length === 0}
			<div class="empty-card">
				<p class="text-white/60">Nenhum plano cadastrado.</p>
			</div>
		{:else}
			<div class="plan-grid">
				{#each plans as plan}
					<div
						class="plan-card hover:bg-white/5 transition-colors {plan.is_active ? '' : 'inactive'}"
					>
						<div class="plan-header">
							<h3 class="plan-title">{plan.name}</h3>
							<span class="status-chip {plan.is_active ? 'active' : 'inactive'}">
								{plan.is_active ? "Ativo" : "Inativo"}
							</span>
						</div>
						<p class="plan-description">
							{plan.description || "Sem descricao."}
						</p>
						<div class="plan-meta">
							<div>
								<span class="meta-value">{plan.items_count ?? 0}</span>
								<span class="meta-label">exercicios</span>
							</div>
							<div>
								<span class="meta-value">{plan.active_assignments ?? 0}</span>
								<span class="meta-label">usuarios ativos</span>
							</div>
						</div>
						<div class="plan-actions">
							<button
								type="button"
								class="plan-action-btn hover:text-white"
								style="color: var(--color-primary-500); border-radius: var(--radius-md);"
								onclick={() => goto(`/training-plans/${plan.id}`)}
							>
								Detalhes
							</button>
							<button
								type="button"
								class="plan-action-btn text-white/80 hover:text-red-300"
								style="border-radius: var(--radius-md);"
								disabled={!plan.is_active}
								onclick={() => handleDeactivate(plan)}
							>
								Desativar
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

<Modal
	isOpen={showCreateModal}
	onClose={() => {
		showCreateModal = false;
		formError = "";
	}}
	title="Novo plano"
>
	<div class="space-y-4">
		<label class="form-field">
			<span>Nome</span>
			<input
				type="text"
				placeholder="Nome do plano"
				bind:value={createName}
			/>
		</label>
		<label class="form-field">
			<span>Descricao</span>
			<textarea
				rows="3"
				placeholder="Opcional"
				bind:value={createDescription}
			></textarea>
		</label>
		{#if formError}
			<p class="form-error">{formError}</p>
		{/if}
		<div class="flex gap-3 justify-end">
			<Button variant="secondary" onclick={() => (showCreateModal = false)}>
				{#snippet children()}Cancelar{/snippet}
			</Button>
			<Button class="btn-radius-md" disabled={isSubmitting} onclick={handleCreatePlan}>
				{#snippet children()}
					{isSubmitting ? "Salvando..." : "Criar"}
				{/snippet}
			</Button>
		</div>
	</div>
</Modal>

<style>
	.plan-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.plan-card {
		background: var(--color-bg-dark-secondary);
		border-radius: var(--radius-standard);
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.plan-card.inactive {
		opacity: 0.65;
	}

	.plan-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.plan-title {
		font-size: 1.05rem;
		font-weight: 600;
		color: #fff;
		margin: 0;
	}

	.plan-description {
		font-size: 0.88rem;
		color: rgba(255, 255, 255, 0.65);
		margin: 0;
	}

	.plan-meta {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.25rem;
	}

	.meta-value {
		display: block;
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.meta-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(255, 255, 255, 0.5);
	}

	.status-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.125rem 0.5rem;
		font-size: 0.75rem;
		line-height: 1.25rem;
		font-weight: 600;
		border-radius: var(--radius-sm);
		text-transform: none;
		letter-spacing: 0;
		text-align: center;
	}

	.status-chip.active {
		color: var(--color-primary-500);
		background-color: color-mix(
			in srgb,
			var(--color-primary-500) 16%,
			transparent
		);
	}

	.status-chip.inactive {
		color: var(--color-gray-400);
		background-color: color-mix(
			in srgb,
			var(--color-gray-400) 12%,
			transparent
		);
	}

	.plan-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.plan-action-btn {
		background: transparent;
		border: none;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		transition: color var(--transition-base),
			background-color var(--transition-base);
	}

	.plan-action-btn:hover {
		background: transparent;
	}

	.plan-action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.empty-card {
		background: var(--color-bg-dark-secondary);
		border-radius: var(--radius-standard);
		padding: 2rem;
		text-align: center;
	}

	.error-banner {
		background: rgba(239, 68, 68, 0.12);
		color: rgba(239, 68, 68, 0.95);
		padding: 0.75rem 1rem;
		border-radius: var(--radius-standard);
		margin-bottom: 1rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.85rem;
	}

	.form-field input,
	.form-field textarea,
	select {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: var(--radius-standard);
		padding: 0.5rem 0.75rem;
		color: #fff;
	}

	.form-error {
		color: rgb(239, 68, 68);
		font-size: 0.8rem;
	}

	:global(.btn-radius-md) {
		border-radius: var(--radius-md) !important;
	}
</style>
