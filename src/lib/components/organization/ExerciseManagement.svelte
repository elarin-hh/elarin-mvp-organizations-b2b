<script lang="ts">
	import { onMount } from 'svelte';
	import { exercisesApi } from '$lib/api/exercises.api';
	import type { ExerciseTemplate, UserExercise } from '$lib/types/exercise';
	import type { OrganizationUser } from '$lib/types/organization';
	import Dumbbell from 'lucide-svelte/icons/dumbbell';
	import Plus from 'lucide-svelte/icons/plus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import X from 'lucide-svelte/icons/x';
	import { Loading } from '$lib/components/common';

	interface Props {
		user: OrganizationUser;
		isOpen: boolean;
		onClose: () => void;
	}

	let { user, isOpen, onClose }: Props = $props();

	let templates = $state<ExerciseTemplate[]>([]);
	let userExercises = $state<UserExercise[]>([]);
	let isLoading = $state(true);
	let isProcessing = $state(false);
	let showAddModal = $state(false);
	let selectedTemplate = $state<ExerciseTemplate | null>(null);

	// Available templates (not yet assigned)
	const availableTemplates = $derived(
		templates.filter(
			(template) => !userExercises.some((exercise) => exercise.type === template.type)
		)
	);

	async function loadData() {
		isLoading = true;

		// Load templates
		const templatesResponse = await exercisesApi.getTemplates();
		if (templatesResponse.success && templatesResponse.data) {
			templates = templatesResponse.data;
		}

		// Load user exercises
		const exercisesResponse = await exercisesApi.getUserExercises(user.user_id);
		if (exercisesResponse.success && exercisesResponse.data) {
			userExercises = exercisesResponse.data;
		}

		isLoading = false;
	}

	async function handleAssignExercise(template: ExerciseTemplate) {
		isProcessing = true;

		const response = await exercisesApi.assignExercise(user.user_id, {
			template_id: template.id
		});

		if (response.success) {
			showAddModal = false;
			selectedTemplate = null;
			await loadData();
		} else {
			alert(response.error?.message || 'Erro ao atribuir exercício');
		}

		isProcessing = false;
	}

	async function handleRemoveExercise(exercise: UserExercise) {
		if (!confirm(`Tem certeza que deseja remover "${exercise.name}"?`)) {
			return;
		}

		isProcessing = true;

		const response = await exercisesApi.removeExercise(user.user_id, exercise.id);

		if (response.success) {
			await loadData();
		} else {
			alert(response.error?.message || 'Erro ao remover exercício');
		}

		isProcessing = false;
	}

	function openAddModal() {
		showAddModal = true;
	}

	function closeAddModal() {
		showAddModal = false;
		selectedTemplate = null;
	}

	onMount(() => {
		if (isOpen) {
			loadData();
		}
	});

	// Reload data when modal is opened
	$effect(() => {
		if (isOpen) {
			loadData();
		}
	});
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
		onclick={onClose}
		role="button"
		tabindex="-1"
	>
		<!-- Modal -->
		<div
			class="glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="px-6 py-5 border-b border-white/10 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<Dumbbell class="w-6 h-6 text-blue-400" stroke-width={2} />
					<div>
						<h2 class="text-xl font-bold text-white">Gerenciar Exercícios</h2>
						<p class="text-sm text-white/70">{user.users.full_name}</p>
					</div>
				</div>
				<button
					onclick={onClose}
					class="glass-button-secondary p-2 text-white/70 hover:text-white"
					aria-label="Fechar"
				>
					<X size={20} />
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-6">
				{#if isLoading}
					<Loading message="Carregando exercícios..." />
				{:else}
					<!-- User Exercises -->
					<div class="mb-6">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-white">
								Exercícios Atribuídos ({userExercises.length})
							</h3>
							<button
								onclick={openAddModal}
								disabled={isProcessing || availableTemplates.length === 0}
								class="glass-button-secondary px-4 py-2 text-white disabled:opacity-50 inline-flex items-center gap-2"
							>
								<Plus size={18} />
								Adicionar Exercício
							</button>
						</div>

						{#if userExercises.length === 0}
							<div class="glass-card p-8 text-center">
								<Dumbbell class="w-12 h-12 text-white/40 mx-auto mb-3" stroke-width={1.5} />
								<p class="text-white/70">Nenhum exercício atribuído</p>
								<p class="text-sm text-white/50 mt-1">
									Clique em "Adicionar Exercício" para começar
								</p>
							</div>
						{:else}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								{#each userExercises as exercise}
									<div class="glass-card p-4 flex items-center justify-between">
										<div class="flex items-center gap-3">
											<div
												class="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center"
											>
												<Dumbbell class="w-5 h-5 text-primary-400" stroke-width={2} />
											</div>
											<div>
												<h4 class="text-white font-medium">{exercise.name}</h4>
												<p class="text-xs text-white/50">{exercise.type}</p>
											</div>
										</div>
										<button
											onclick={() => handleRemoveExercise(exercise)}
											disabled={isProcessing}
											class="glass-button-secondary p-2 text-red-400 hover:text-red-300 disabled:opacity-50"
											aria-label="Remover exercício"
										>
											<Trash2 size={18} />
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Available Templates Info -->
					{#if availableTemplates.length === 0}
						<div class="glass-card p-4 bg-blue-500/10 border border-blue-500/20">
							<p class="text-blue-300 text-sm">
								Todos os exercícios disponíveis já foram atribuídos a este usuário.
							</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>

	<!-- Add Exercise Modal -->
	{#if showAddModal}
		<div
			class="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"
			onclick={closeAddModal}
			role="button"
			tabindex="-1"
		>
			<div
				class="glass-card max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
				onclick={(e) => e.stopPropagation()}
				role="dialog"
				tabindex="-1"
			>
				<!-- Header -->
				<div class="px-6 py-5 border-b border-white/10 flex items-center justify-between">
					<h3 class="text-lg font-bold text-white">Selecionar Exercício</h3>
					<button
						onclick={closeAddModal}
						class="glass-button-secondary p-2 text-white/70 hover:text-white"
						aria-label="Fechar"
					>
						<X size={20} />
					</button>
				</div>

				<!-- Content -->
				<div class="flex-1 overflow-y-auto p-6">
					{#if availableTemplates.length === 0}
						<div class="text-center py-8">
							<p class="text-white/70">Nenhum exercício disponível</p>
						</div>
					{:else}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each availableTemplates as template}
								<button
									onclick={() => handleAssignExercise(template)}
									disabled={isProcessing}
									class="glass-card p-4 text-left hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-3"
								>
									<div
										class="w-12 h-12 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0"
									>
										<Dumbbell class="w-6 h-6 text-primary-400" stroke-width={2} />
									</div>
									<div class="flex-1 min-w-0">
										<h4 class="text-white font-medium truncate">{template.name}</h4>
										<p class="text-xs text-white/50 truncate">{template.type}</p>
										{#if template.description}
											<p class="text-xs text-white/40 mt-1 line-clamp-2">
												{template.description}
											</p>
										{/if}
									</div>
									<Plus class="w-5 h-5 text-primary-400 flex-shrink-0" stroke-width={2} />
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
{/if}
