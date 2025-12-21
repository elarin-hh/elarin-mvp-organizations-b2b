<script lang="ts">
	import { goto } from "$app/navigation";
	import { organizationsApi } from "$lib/api/organizations.api";
	import type { OrganizationUser } from "$lib/types/organization";
	import Trash2 from "lucide-svelte/icons/trash-2";
	import Users from "lucide-svelte/icons/users";
	import Settings from "lucide-svelte/icons/settings";
	import Search from "lucide-svelte/icons/search";

	interface Props {
		users: OrganizationUser[];
		onUpdate?: () => Promise<void>;
	}

	let { users, onUpdate }: Props = $props();

	let searchTerm = $state("");
	let isLoading = $state(false);
	let showDeleteModal = $state(false);
	let userToDelete = $state<OrganizationUser | null>(null);

	// Filter users based on search term
	const filteredUsers = $derived(
		users.filter((user) => {
			if (!searchTerm) return true;
			const search = searchTerm.toLowerCase();
			return (
				user.users.full_name.toLowerCase().includes(search) ||
				user.users.email.toLowerCase().includes(search)
			);
		}),
	);

	function openUserDetails(user: OrganizationUser) {
		goto(`/usuarios/${user.user_id}`);
	}

	function confirmDelete(user: OrganizationUser) {
		userToDelete = user;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (!userToDelete) return;

		isLoading = true;
		const response = await organizationsApi.removeUser(
			userToDelete.user_id,
		);

		if (response.success) {
			showDeleteModal = false;
			userToDelete = null;
			await onUpdate?.();
		} else {
			alert(response.error || "Erro ao remover usuário");
		}

		isLoading = false;
	}

	function cancelDelete() {
		showDeleteModal = false;
		userToDelete = null;
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
			<div
				class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
			>
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
			<div
				class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4"
			>
				<Users class="w-8 h-8 text-white/40" stroke-width={1.5} />
			</div>
			<p class="text-white/70 text-lg">
				Nenhum usuário vinculado à organização
			</p>
		</div>
	{:else if filteredUsers.length === 0}
		<div class="px-6 py-16 text-center">
			<div
				class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4"
			>
				<Search class="w-8 h-8 text-white/40" stroke-width={1.5} />
			</div>
			<p class="text-white/70 text-lg">Nenhum usuário encontrado</p>
			<p class="text-white/50 text-sm mt-1">
				Tente buscar com outros termos
			</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-white/5">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider"
						>
							Usuário
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider"
						>
							Email
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider"
						>
							Função
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider"
						>
							Status
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider"
						>
							Ações
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/10">
					{#each filteredUsers as user}
						<tr
							class="hover:bg-white/5 transition-colors cursor-pointer"
							onclick={() => openUserDetails(user)}
						>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center">
									{#if user.users.avatar_url}
										<img
											src={user.users.avatar_url}
											alt={user.users.full_name}
											class="h-10 w-10 rounded-full"
										/>
									{:else}
										<div
											class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center"
										>
											<span
												class="text-white font-medium"
											>
												{user.users.full_name
													.charAt(0)
													.toUpperCase()}
											</span>
										</div>
									{/if}
									<div class="ml-4">
										<div
											class="text-sm font-medium text-white"
										>
											{user.users.full_name}
										</div>
									</div>
								</div>
							</td>
							<td
								class="px-6 py-4 whitespace-nowrap text-sm text-white/70"
							>
								{user.users.email}
							</td>
							<td
								class="px-6 py-4 whitespace-nowrap text-sm text-white/70"
							>
								{user.role}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {user.status ===
									'ACTIVE'
										? 'bg-green-400/10 text-green-400'
										: 'bg-gray-400/10 text-gray-400'}"
								>
									{user.status === "ACTIVE"
										? "Ativo"
										: "Inativo"}
								</span>
							</td>
							<td
								class="px-6 py-4 whitespace-nowrap text-sm font-medium"
								onclick={(e) => e.stopPropagation()}
							>
								<button
									onclick={() => openUserDetails(user)}
									class="glass-button-secondary px-3 py-1.5 text-white inline-flex items-center gap-2 mr-2"
									title="Ver detalhes"
								>
									<Settings size={14} /> Detalhes
								</button>
								<button
									onclick={() => confirmDelete(user)}
									disabled={isLoading}
									class="glass-button-secondary px-3 py-1.5 text-red-400 hover:text-red-300 disabled:opacity-50 inline-flex items-center gap-2"
									title="Remover usuário"
								>
									<Trash2 size={14} />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && userToDelete}
	<div
		class="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]"
	>
		<div class="glass-card max-w-md w-full mx-4 p-6">
			<h3 class="text-lg font-bold text-white mb-4">Confirmar Remoção</h3>
			<p class="text-white/70 mb-6">
				Tem certeza que deseja remover o usuário <strong
					class="text-white">{userToDelete.users.full_name}</strong
				> da organização?
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
					{isLoading ? "Removendo..." : "Remover"}
				</button>
			</div>
		</div>
	</div>
{/if}
