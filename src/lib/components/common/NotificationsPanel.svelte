<script lang="ts">
	import { organizationsApi } from '$lib/api/organizations.api';
	import type { OrganizationUser } from '$lib/types/organization';
	import Check from 'lucide-svelte/icons/check';
	import X from 'lucide-svelte/icons/x';
	import Bell from 'lucide-svelte/icons/bell';

	interface Props {
		users: OrganizationUser[];
		isOpen: boolean;
		onClose: () => void;
		onUpdate?: () => Promise<void>;
	}

	let { users, isOpen, onClose, onUpdate }: Props = $props();

	let processingUserId = $state<string | null>(null);

	async function handleApprove(user: OrganizationUser) {
		processingUserId = user.user_id;
		const response = await organizationsApi.approveUser(user.user_id);

		if (response.success) {
			await onUpdate?.();
		} else {
			alert(response.error || 'Erro ao aprovar usuário');
		}

		processingUserId = null;
	}

	async function handleReject(user: OrganizationUser) {
		processingUserId = user.user_id;
		const response = await organizationsApi.rejectUser(user.user_id);

		if (response.success) {
			await onUpdate?.();
		} else {
			alert(response.error || 'Erro ao rejeitar usuário');
		}

		processingUserId = null;
	}
</script>

{#if isOpen}
	<div class="notifications-dropdown">
		<div class="p-4 border-b border-white/10">
			<h3 class="text-lg font-bold text-white flex items-center gap-2">
				<Bell class="w-5 h-5 text-yellow-400" />
				Usuários Pendentes
			</h3>
			<p class="text-xs text-white/50 mt-1">
				{users.length} {users.length === 1 ? 'usuário aguardando' : 'usuários aguardando'} aprovação
			</p>
		</div>

		<div class="max-h-[60vh] overflow-y-auto">
			{#if users.length === 0}
				<div class="p-8 text-center">
					<Check class="w-12 h-12 text-green-400 mx-auto mb-3" stroke-width={1.5} />
					<p class="text-white/70 font-medium">Tudo em dia!</p>
					<p class="text-xs text-white/50 mt-1">Nenhum usuário pendente</p>
				</div>
			{:else}
				<div class="divide-y divide-white/10">
					{#each users as user}
						<div class="p-4 hover:bg-white/5 transition-colors">
							<div class="flex items-start gap-3">
								{#if user.users.avatar_url}
									<img
										src={user.users.avatar_url}
										alt={user.users.full_name}
										class="w-10 h-10 rounded-full flex-shrink-0"
									/>
								{:else}
									<div class="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center flex-shrink-0">
										<span class="text-white text-sm font-medium">
											{user.users.full_name.charAt(0).toUpperCase()}
										</span>
									</div>
								{/if}

								<div class="flex-1 min-w-0">
									<p class="text-white font-medium text-sm truncate">
										{user.users.full_name}
									</p>
									<p class="text-white/50 text-xs truncate">{user.users.email}</p>
									<p class="text-white/40 text-xs mt-1">
										{new Date(user.created_at).toLocaleDateString('pt-BR')}
									</p>

									<div class="flex gap-2 mt-3">
										<button
											onclick={() => handleApprove(user)}
											disabled={processingUserId === user.user_id}
											class="flex-1 glass-button-secondary px-3 py-1.5 text-green-400 hover:text-green-300 disabled:opacity-50 text-xs font-medium inline-flex items-center justify-center gap-1"
										>
											<Check size={14} />
											{processingUserId === user.user_id ? 'Aprovando...' : 'Aprovar'}
										</button>
										<button
											onclick={() => handleReject(user)}
											disabled={processingUserId === user.user_id}
											class="flex-1 glass-button-secondary px-3 py-1.5 text-red-400 hover:text-red-300 disabled:opacity-50 text-xs font-medium inline-flex items-center justify-center gap-1"
										>
											<X size={14} />
											{processingUserId === user.user_id ? 'Rejeitando...' : 'Rejeitar'}
										</button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.notifications-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: 380px;
		max-width: 90vw;
		background: var(--color-glass-dark-strong);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid var(--color-border-light);
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		z-index: 9999;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
