<script lang="ts">
	import { goto } from "$app/navigation";
	import type { PageData } from "./$types";
	import Button from "$lib/components/common/Button.svelte";
	import Modal from "$lib/components/common/Modal.svelte";
	import { organizationsApi } from "$lib/api/organizations.api";
	import type { ExerciseTemplate } from "$lib/types/exercise";
	import type {
		TrainingPlanDetails,
		TrainingPlanItem
	} from "$lib/types/training-plan";
	import ArrowLeft from "lucide-svelte/icons/arrow-left";
	import Trash2 from "lucide-svelte/icons/trash-2";

	let { data }: { data: PageData } = $props();

	let plan = $state<TrainingPlanDetails>(data.plan);
	let items = $state<TrainingPlanItem[]>(data.plan?.items ?? []);
	let templates = $state<ExerciseTemplate[]>(data.templates ?? []);
	let showAddModal = $state(false);
	let formError = $state("");
	let updateError = $state("");

	let editName = $state(plan.name ?? "");
	let editDescription = $state(plan.description ?? "");
	let isSavingPlan = $state(false);

	let newTemplateId = $state<number | null>(null);
	let newPosition = $state<number | null>(null);
	let newTargetReps = $state<number | null>(null);
	let newTargetSets = $state<number | null>(null);
	let newTargetDuration = $state<number | null>(null);
	let newRestSeconds = $state<number | null>(null);
	let isAddingItem = $state(false);

	function sortItems(list: TrainingPlanItem[]) {
		return list.slice().sort((a, b) => (a.position || 0) - (b.position || 0));
	}

	function getItemName(item: TrainingPlanItem) {
		return (
			item.exercise_template?.name_pt ||
			item.exercise_template?.name ||
			item.exercise_type ||
			"Exercicio"
		);
	}

	function updateItemField(
		itemId: number,
		field: keyof TrainingPlanItem,
		value: number | null
	) {
		items = items.map((item) =>
			item.id === itemId ? { ...item, [field]: value } : item
		);
	}

	async function handleSavePlan() {
		if (!editName.trim()) {
			updateError = "Nome do plano obrigatorio.";
			return;
		}
		updateError = "";
		isSavingPlan = true;

		const response = await organizationsApi.updateTrainingPlan(plan.id, {
			name: editName.trim(),
			description: editDescription.trim() || null
		});

		if (response.success) {
			plan = { ...plan, ...response.data };
		} else {
			updateError = response.error?.message || "Erro ao atualizar plano.";
		}

		isSavingPlan = false;
	}

	async function handleDeactivate() {
		if (!confirm("Deseja desativar este plano?")) return;

		const response = await organizationsApi.deleteTrainingPlan(plan.id);
		if (response.success) {
			plan = { ...plan, is_active: false };
		} else {
			updateError = response.error?.message || "Erro ao desativar plano.";
		}
	}

	async function handleAddItem() {
		if (!newTemplateId) {
			formError = "Selecione um template.";
			return;
		}
		formError = "";
		isAddingItem = true;

		const response = await organizationsApi.addTrainingPlanItem(plan.id, {
			template_id: newTemplateId,
			position: newPosition ?? undefined,
			target_reps: newTargetReps ?? undefined,
			target_sets: newTargetSets ?? undefined,
			target_duration_sec: newTargetDuration ?? undefined,
			rest_seconds: newRestSeconds ?? undefined
		});

		if (response.success) {
			items = sortItems([...items, response.data]);
			showAddModal = false;
			newTemplateId = null;
			newPosition = null;
			newTargetReps = null;
			newTargetSets = null;
			newTargetDuration = null;
			newRestSeconds = null;
		} else {
			formError = response.error?.message || "Erro ao adicionar item.";
		}

		isAddingItem = false;
	}

	async function handleUpdateItem(item: TrainingPlanItem) {
		updateError = "";
		const response = await organizationsApi.updateTrainingPlanItem(plan.id, item.id, {
			position: item.position,
			target_reps: item.target_reps ?? undefined,
			target_sets: item.target_sets ?? undefined,
			target_duration_sec: item.target_duration_sec ?? undefined,
			rest_seconds: item.rest_seconds ?? undefined
		});

		if (response.success) {
			items = sortItems(
				items.map((existing) =>
					existing.id === item.id ? response.data : existing
				)
			);
		} else {
			updateError = response.error?.message || "Erro ao atualizar item.";
		}
	}

	async function handleRemoveItem(item: TrainingPlanItem) {
		if (!confirm("Deseja remover este item?")) return;

		const response = await organizationsApi.removeTrainingPlanItem(plan.id, item.id);
		if (response.success) {
			items = items.filter((entry) => entry.id !== item.id);
		} else {
			updateError = response.error?.message || "Erro ao remover item.";
		}
	}
</script>

<div class="min-h-full pb-8">
	<main class="w-full min-h-full px-6 pt-8">
		<button
			class="flex items-center text-white/50 mb-4 transition-colors"
			onclick={() => goto("/training-plans")}
		>
			<ArrowLeft size={20} class="mr-2" />
			Voltar
		</button>

		<div class="plan-card p-5 mb-6">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 class="text-2xl font-bold text-white">{plan.name}</h1>
					<p class="text-white/50 text-sm mt-1">
						Status: {plan.is_active ? "Ativo" : "Inativo"}
					</p>
				</div>
				<div class="flex gap-2">
					<Button variant="outline" onclick={() => (showAddModal = true)}>
						{#snippet children()}Adicionar item{/snippet}
					</Button>
					<Button variant="secondary" onclick={handleDeactivate} disabled={!plan.is_active}>
						{#snippet children()}Desativar{/snippet}
					</Button>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
				<label class="form-field">
					<span>Nome do plano</span>
					<input type="text" bind:value={editName} />
				</label>
				<label class="form-field">
					<span>Descricao</span>
					<input type="text" bind:value={editDescription} />
				</label>
			</div>
			<div class="flex items-center gap-3 mt-4">
				<Button onclick={handleSavePlan} disabled={isSavingPlan}>
					{#snippet children()}
						{isSavingPlan ? "Salvando..." : "Salvar"}
					{/snippet}
				</Button>
				{#if updateError}
					<span class="form-error">{updateError}</span>
				{/if}
			</div>
		</div>

		<div class="items-header">
			<h2 class="text-xl font-bold text-white">Itens do plano</h2>
			<span class="text-white/50 text-sm">Total: {items.length}</span>
		</div>

		{#if items.length === 0}
			<div class="empty-card">
				<p class="text-white/60">Nenhum item adicionado.</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each items as item}
					<div class="plan-item-card">
						<div class="item-header">
							<div>
								<h3 class="text-white font-semibold">
									#{item.position} - {getItemName(item)}
								</h3>
								<p class="text-white/50 text-xs">
									Template: {item.exercise_template?.type || item.exercise_type}
								</p>
							</div>
							<Button variant="outline" onclick={() => handleUpdateItem(item)}>
								{#snippet children()}Salvar{/snippet}
							</Button>
						</div>

						<div class="item-grid">
							<label class="form-field">
								<span>Posicao</span>
								<input
									type="number"
									min="1"
									value={item.position}
									oninput={(e) =>
										updateItemField(
											item.id,
											"position",
											Number((e.target as HTMLInputElement).value)
										)}
								/>
							</label>
							<label class="form-field">
								<span>Reps</span>
								<input
									type="number"
									min="0"
									value={item.target_reps ?? ""}
									oninput={(e) =>
										updateItemField(
											item.id,
											"target_reps",
											(e.target as HTMLInputElement).value === ""
												? null
												: Number((e.target as HTMLInputElement).value)
										)}
								/>
							</label>
							<label class="form-field">
								<span>Series</span>
								<input
									type="number"
									min="0"
									value={item.target_sets ?? ""}
									oninput={(e) =>
										updateItemField(
											item.id,
											"target_sets",
											(e.target as HTMLInputElement).value === ""
												? null
												: Number((e.target as HTMLInputElement).value)
										)}
								/>
							</label>
							<label class="form-field">
								<span>Duracao (s)</span>
								<input
									type="number"
									min="0"
									value={item.target_duration_sec ?? ""}
									oninput={(e) =>
										updateItemField(
											item.id,
											"target_duration_sec",
											(e.target as HTMLInputElement).value === ""
												? null
												: Number((e.target as HTMLInputElement).value)
										)}
								/>
							</label>
							<label class="form-field">
								<span>Descanso (s)</span>
								<input
									type="number"
									min="0"
									value={item.rest_seconds ?? ""}
									oninput={(e) =>
										updateItemField(
											item.id,
											"rest_seconds",
											(e.target as HTMLInputElement).value === ""
												? null
												: Number((e.target as HTMLInputElement).value)
										)}
								/>
							</label>
							<button
								class="remove-btn"
								onclick={() => handleRemoveItem(item)}
							>
								<Trash2 size={16} /> Remover
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

<Modal
	isOpen={showAddModal}
	onClose={() => {
		showAddModal = false;
		formError = "";
	}}
	title="Adicionar item"
>
	<div class="space-y-4">
		<label class="form-field">
			<span>Template</span>
			<select
				onchange={(e) =>
					(newTemplateId = Number((e.target as HTMLSelectElement).value))}
			>
				<option value="">Selecione</option>
				{#each templates as template}
					<option value={template.id}>
						{template.name_pt || template.name} ({template.type})
					</option>
				{/each}
			</select>
		</label>
		<label class="form-field">
			<span>Posicao (opcional)</span>
			<input
				type="number"
				min="1"
				value={newPosition ?? ""}
				oninput={(e) =>
					(newPosition =
						(e.target as HTMLInputElement).value === ""
							? null
							: Number((e.target as HTMLInputElement).value))}
			/>
		</label>
		<div class="grid grid-cols-2 gap-3">
			<label class="form-field">
				<span>Reps</span>
				<input
					type="number"
					min="0"
					value={newTargetReps ?? ""}
					oninput={(e) =>
						(newTargetReps =
							(e.target as HTMLInputElement).value === ""
								? null
								: Number((e.target as HTMLInputElement).value))}
				/>
			</label>
			<label class="form-field">
				<span>Series</span>
				<input
					type="number"
					min="0"
					value={newTargetSets ?? ""}
					oninput={(e) =>
						(newTargetSets =
							(e.target as HTMLInputElement).value === ""
								? null
								: Number((e.target as HTMLInputElement).value))}
				/>
			</label>
			<label class="form-field">
				<span>Duracao (s)</span>
				<input
					type="number"
					min="0"
					value={newTargetDuration ?? ""}
					oninput={(e) =>
						(newTargetDuration =
							(e.target as HTMLInputElement).value === ""
								? null
								: Number((e.target as HTMLInputElement).value))}
				/>
			</label>
			<label class="form-field">
				<span>Descanso (s)</span>
				<input
					type="number"
					min="0"
					value={newRestSeconds ?? ""}
					oninput={(e) =>
						(newRestSeconds =
							(e.target as HTMLInputElement).value === ""
								? null
								: Number((e.target as HTMLInputElement).value))}
				/>
			</label>
		</div>
		{#if formError}
			<p class="form-error">{formError}</p>
		{/if}
		<div class="flex gap-3 justify-end">
			<Button variant="secondary" onclick={() => (showAddModal = false)}>
				{#snippet children()}Cancelar{/snippet}
			</Button>
			<Button disabled={isAddingItem} onclick={handleAddItem}>
				{#snippet children()}
					{isAddingItem ? "Adicionando..." : "Adicionar"}
				{/snippet}
			</Button>
		</div>
	</div>
</Modal>

<style>
	.plan-card {
		background: var(--color-bg-dark-secondary);
		border-radius: var(--radius-standard);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.items-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.plan-item-card {
		background: var(--color-bg-dark-secondary);
		border-radius: var(--radius-standard);
		border: 1px solid rgba(255, 255, 255, 0.08);
		padding: 1rem;
	}

	.item-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.item-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
		align-items: end;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.8rem;
	}

	.form-field input,
	.form-field select {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: var(--radius-standard);
		padding: 0.45rem 0.65rem;
		color: #fff;
	}

	.form-error {
		color: rgb(239, 68, 68);
		font-size: 0.8rem;
	}

	.empty-card {
		background: var(--color-bg-dark-secondary);
		border-radius: var(--radius-standard);
		padding: 2rem;
		text-align: center;
		border: 1px dashed rgba(255, 255, 255, 0.1);
	}

	.remove-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.45rem 0.7rem;
		border-radius: var(--radius-standard);
		background: rgba(239, 68, 68, 0.08);
		color: rgb(239, 68, 68);
		border: none;
		cursor: pointer;
		height: fit-content;
	}
</style>
