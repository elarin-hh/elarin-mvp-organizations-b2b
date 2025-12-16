<script lang="ts">
	import { organizationsApi } from '$lib/api/organizations.api';
	import type { OrganizationUser } from '$lib/types/organization';
	import UserCheck from 'lucide-svelte/icons/user-check';
	import UserX from 'lucide-svelte/icons/user-x';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import Users from 'lucide-svelte/icons/users';
	import CircleOff from 'lucide-svelte/icons/circle-off';
	import Dumbbell from 'lucide-svelte/icons/dumbbell';
	import Settings from 'lucide-svelte/icons/settings';
	import Search from 'lucide-svelte/icons/search';
	import X from 'lucide-svelte/icons/x';
	import ExerciseManagement from './ExerciseManagement.svelte';

	interface Props {
		users: OrganizationUser[];
		onUpdate?: () => Promise<void>;
	}

	let { users, onUpdate }: Props = $props();

	let searchTerm = $state('');
	let isLoading = $state(false);
	let showDeleteModal = $state(false);
	let showToggleModal = $state(false);
	let showExerciseModal = $state(false);
	let showSettingsModal = $state(false);
	let userToDelete = $state<OrganizationUser | null>(null);
	let userToToggle = $state<OrganizationUser | null>(null);
	let userToManageExercises = $state<OrganizationUser | null>(null);
	let userToManage = $state<OrganizationUser | null>(null);

	// Filter users based on search term
	const filteredUsers = $derived(
		users.filter(user => {
			if (!searchTerm) return true;
			const search = searchTerm.toLowerCase();
			return (
				user.users.full_name.toLowerCase().includes(search) ||
				user.users.email.toLowerCase().includes(search)
			);
		})
	);

	function confirmToggleStatus(user: OrganizationUser) {
		userToToggle = user;
		showToggleModal = true;
	}

	async function handleToggleStatus() {
		if (!userToToggle) return;

		isLoading = true;

		try {
			const response = await organizationsApi.toggleUserStatus(userToToggle.user_id);

			if (response.success) {
				// Close modal and reload data to ensure UI reflects the correct state
				showToggleModal = false;
				userToToggle = null;
				await onUpdate?.();
			} else {
				alert(response.error?.message || response.error || 'Erro ao alterar status do usuário');
			}
		} catch (error) {
			alert('Erro ao alterar status do usuário');
		}

		isLoading = false;
	}

	function cancelToggle() {
		showToggleModal = false;
		userToToggle = null;
	}

	function confirmDelete(user: OrganizationUser) {
		userToDelete = user;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (!userToDelete) return;

		isLoading = true;
		const response = await organizationsApi.removeUser(userToDelete.user_id);

		if (response.success) {
			showDeleteModal = false;
			userToDelete = null;
			await onUpdate?.();
		} else {
			alert(response.error || 'Erro ao remover usuário');
		}

		isLoading = false;
	}

	function cancelDelete() {
		showDeleteModal = false;
		userToDelete = null;
	}

	function openExerciseManagement(user: OrganizationUser) {
		userToManageExercises = user;
		showExerciseModal = true;
	}

	function closeExerciseManagement() {
		showExerciseModal = false;
		userToManageExercises = null;
	}

	function openSettingsModal(user: OrganizationUser) {
		userToManage = user;
		showSettingsModal = true;
	}

	function closeSettingsModal() {
		showSettingsModal = false;
		userToManage = null;
	}

	function handleManageExercisesFromSettings() {
		if (userToManage) {
			openExerciseManagement(userToManage);
			closeSettingsModal();
		}
	}

	function handleToggleStatusFromSettings() {
		if (userToManage) {
			confirmToggleStatus(userToManage);
			closeSettingsModal();
		}
	}

	function handleDeleteFromSettings() {
		if (userToManage) {
			confirmDelete(userToManage);
			closeSettingsModal();
		}
	}
</script>

<div class="glass-card">
	<div class="px-6 py-5 border-b border-white/10">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-3">
				<Users class="w-6 h-6 text-blue-400" stroke-width={2} />
				<h2 class="text-xl font-bold text-white">Usuários</h2>
			</div>
		</div>

		<!-- Search Input -->
		<div class="relative">
			<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<Search class="w-5 h-5 text-white/40" />
			</div>
			<input
				type="text"
				bind:value={searchTerm}
				placeholder="Buscar por nome ou email..."
				class="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
			/>
		</div>
	</div>

	{#if users.length === 0}
		<div class="px-6 py-16 text-center">
			<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
				<Users class="w-8 h-8 text-white/40" stroke-width={1.5} />
			</div>
			<p class="text-white/70 text-lg">Nenhum usuário vinculado à organização</p>
		</div>
	{:else if filteredUsers.length === 0}
		<div class="px-6 py-16 text-center">
			<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
				<Search class="w-8 h-8 text-white/40" stroke-width={1.5} />
			</div>
			<p class="text-white/70 text-lg">Nenhum usuário encontrado</p>
			<p class="text-white/50 text-sm mt-1">Tente buscar com outros termos</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-white/5">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
							Usuário
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
							Email
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
							Função
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
							Status
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
							Configurações
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/10">
					{#each filteredUsers as user}
						<tr class="hover:bg-white/5 transition-colors">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center">
									{#if user.users.avatar_url}
										<img
											src={user.users.avatar_url}
											alt={user.users.full_name}
											class="h-10 w-10 rounded-full"
										/>
									{:else}
										<div class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
											<span class="text-white font-medium">
												{user.users.full_name.charAt(0).toUpperCase()}
											</span>
										</div>
									{/if}
									<div class="ml-4">
										<div class="text-sm font-medium text-white">
											{user.users.full_name}
										</div>
									</div>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-white/70">
								{user.users.email}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-white/70">
								{user.role}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {
										user.status === 'ACTIVE'
											? 'bg-green-400/10 text-green-400'
											: 'bg-gray-400/10 text-gray-400'
									}"
								>
									{user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
								<button
									onclick={() => openSettingsModal(user)}
									disabled={isLoading}
									class="glass-button-secondary px-4 py-2 text-white disabled:opacity-50 inline-flex items-center gap-2"
									title="Configurações do usuário"
								>
									<Settings size={16} />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Settings Modal -->
{#if showSettingsModal && userToManage}
	<div
		class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
		onclick={closeSettingsModal}
		role="button"
		tabindex="-1"
	>
		<div
			class="glass-card max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="px-6 py-5 border-b border-white/10 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<Settings class="w-6 h-6 text-blue-400" stroke-width={2} />
					<h3 class="text-lg font-bold text-white">Configurações do Usuário</h3>
				</div>
				<button
					onclick={closeSettingsModal}
					class="glass-button-secondary p-2 text-white/70 hover:text-white"
					aria-label="Fechar"
				>
					<X size={20} />
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-6">
				<!-- User Profile Section -->
				<div class="glass-card p-6 mb-6">
					<div class="flex items-start gap-6">
						<!-- Avatar -->
						<div class="flex-shrink-0">
							{#if userToManage.users.avatar_url}
								<img
									src={userToManage.users.avatar_url}
									alt={userToManage.users.full_name}
									class="w-24 h-24 rounded-full border-2 border-primary-500"
								/>
							{:else}
								<div class="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center border-2 border-primary-500">
									<span class="text-white text-3xl font-bold">
										{userToManage.users.full_name.charAt(0).toUpperCase()}
									</span>
								</div>
							{/if}
						</div>

						<!-- User Info -->
						<div class="flex-1 space-y-4">
							<div>
								<h4 class="text-2xl font-bold text-white mb-1">{userToManage.users.full_name}</h4>
								<p class="text-white/70">{userToManage.users.email}</p>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<!-- Role -->
								<div>
									<p class="text-xs text-white/50 uppercase tracking-wider mb-1">Função</p>
									<p class="text-white font-medium">{userToManage.role}</p>
								</div>

								<!-- Status -->
								<div>
									<p class="text-xs text-white/50 uppercase tracking-wider mb-1">Status</p>
									<span
										class="inline-flex px-3 py-1 text-xs font-semibold rounded-full {
											userToManage.status === 'ACTIVE'
												? 'bg-green-400/10 text-green-400'
												: 'bg-gray-400/10 text-gray-400'
										}"
									>
										{userToManage.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
									</span>
								</div>

								<!-- Vinculado em -->
								<div>
									<p class="text-xs text-white/50 uppercase tracking-wider mb-1">Vinculado em</p>
									<p class="text-white/70">
										{new Date(userToManage.created_at).toLocaleDateString('pt-BR', {
											day: '2-digit',
											month: 'long',
											year: 'numeric'
										})}
									</p>
								</div>

								<!-- Cadastrado em -->
								<div>
									<p class="text-xs text-white/50 uppercase tracking-wider mb-1">Cadastrado em</p>
									<p class="text-white/70">
										{new Date(userToManage.users.created_at).toLocaleDateString('pt-BR', {
											day: '2-digit',
											month: 'long',
											year: 'numeric'
										})}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Actions Section -->
				<div>
					<h4 class="text-lg font-semibold text-white mb-4">Ações</h4>
					<div class="grid grid-cols-1 gap-3">
						<!-- Manage Exercises -->
						<button
							onclick={handleManageExercisesFromSettings}
							disabled={isLoading}
							class="glass-card p-4 text-left hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-3"
						>
							<div class="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
								<Dumbbell class="w-6 h-6 text-blue-400" stroke-width={2} />
							</div>
							<div class="flex-1">
								<h4 class="text-white font-medium">Gerenciar Exercícios</h4>
								<p class="text-xs text-white/50">Atrelar ou remover exercícios do usuário</p>
							</div>
						</button>

						<!-- Toggle Status -->
						<button
							onclick={handleToggleStatusFromSettings}
							disabled={isLoading}
							class="glass-card p-4 text-left hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-3"
						>
							<div class="w-12 h-12 rounded-lg bg-yellow-600/20 flex items-center justify-center">
								{#if userToManage.status === 'ACTIVE'}
									<CircleOff class="w-6 h-6 text-yellow-400" stroke-width={2} />
								{:else}
									<UserCheck class="w-6 h-6 text-green-400" stroke-width={2} />
								{/if}
							</div>
							<div class="flex-1">
								<h4 class="text-white font-medium">
									{userToManage.status === 'ACTIVE' ? 'Desativar Usuário' : 'Ativar Usuário'}
								</h4>
								<p class="text-xs text-white/50">
									{userToManage.status === 'ACTIVE'
										? 'Impedir acesso do usuário ao sistema'
										: 'Permitir acesso do usuário ao sistema'}
								</p>
							</div>
						</button>

						<!-- Remove User -->
						<button
							onclick={handleDeleteFromSettings}
							disabled={isLoading}
							class="glass-card p-4 text-left hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-3"
						>
							<div class="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center">
								<Trash2 class="w-6 h-6 text-red-400" stroke-width={2} />
							</div>
							<div class="flex-1">
								<h4 class="text-white font-medium">Remover Usuário</h4>
								<p class="text-xs text-white/50">Remover usuário da organização permanentemente</p>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Toggle Status Confirmation Modal -->
{#if showToggleModal && userToToggle}
	<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
		<div class="glass-card max-w-md w-full mx-4 p-6">
			<h3 class="text-lg font-bold text-white mb-4">
				{userToToggle.status === 'ACTIVE' ? 'Confirmar Desativação' : 'Confirmar Ativação'}
			</h3>
			<p class="text-white/70 mb-6">
				Tem certeza que deseja {userToToggle.status === 'ACTIVE' ? 'desativar' : 'ativar'} o usuário <strong class="text-white">{userToToggle.users.full_name}</strong>?
			</p>
			<div class="flex justify-end space-x-3">
				<button
					onclick={cancelToggle}
					disabled={isLoading}
					class="glass-button-secondary px-4 py-2 text-white disabled:opacity-50"
				>
					Cancelar
				</button>
				<button
					onclick={handleToggleStatus}
					disabled={isLoading}
					class="glass-button-secondary px-4 py-2 text-white disabled:opacity-50"
				>
					{isLoading ? 'Processando...' : userToToggle.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && userToDelete}
	<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
		<div class="glass-card max-w-md w-full mx-4 p-6">
			<h3 class="text-lg font-bold text-white mb-4">Confirmar Remoção</h3>
			<p class="text-white/70 mb-6">
				Tem certeza que deseja remover o usuário <strong class="text-white">{userToDelete.users.full_name}</strong> da organização?
			</p>
			<div class="flex justify-end space-x-3">
				<button
					onclick={cancelDelete}
					disabled={isLoading}
					class="glass-button-secondary px-4 py-2 text-white disabled:opacity-50"
				>
					Cancelar
				</button>
				<button
					onclick={handleDelete}
					disabled={isLoading}
					class="glass-button-secondary px-4 py-2 text-red-400 hover:text-red-300 disabled:opacity-50"
				>
					{isLoading ? 'Removendo...' : 'Remover'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Exercise Management Modal -->
{#if userToManageExercises}
	<ExerciseManagement
		user={userToManageExercises}
		isOpen={showExerciseModal}
		onClose={closeExerciseManagement}
	/>
{/if}
