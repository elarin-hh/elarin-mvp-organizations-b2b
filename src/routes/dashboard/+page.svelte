<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import {
		currentOrganization,
		organizationAuthActions,
	} from "$lib/stores/organization-auth.store";
	import { organizationsApi } from "$lib/api/organizations.api";
	import { AppHeader, Loading } from "$lib/components/common";
	import StatsCard from "$lib/components/organization/StatsCard.svelte";
	import type {
		OrganizationUser,
		OrganizationStats,
	} from "$lib/types/organization";
	import Users from "lucide-svelte/icons/users";
	import UserCheck from "lucide-svelte/icons/user-check";
	import Megaphone from "lucide-svelte/icons/megaphone";
	import Calendar from "lucide-svelte/icons/calendar";
	import X from "lucide-svelte/icons/x";

	const organization = $derived($currentOrganization);

	let pendingUsers = $state<OrganizationUser[]>([]);
	let stats = $state<OrganizationStats>({
		total_users: 0,
		active_users: 0,
		inactive_users: 0,
		pending_users: 0,
	});
	let isLoading = $state(true);
	let isScrolled = $state(false);
	let showAvatarMenu = $state(false);
	let showNotifications = $state(false);

	let novidades = $state<Array<any>>([]);

	async function removeNovidade(id: number) {
		novidades = novidades.filter((n) => n.id !== id);
	}

	async function loadData() {
		isLoading = true;

		const pendingResponse = await organizationsApi.getPendingUsers();
		if (pendingResponse.success && pendingResponse.data) {
			pendingUsers = pendingResponse.data;
		}

		const statsResponse = await organizationsApi.getStats();
		if (statsResponse.success && statsResponse.data) {
			stats = {
				...statsResponse.data,
				pending_users: pendingUsers.length,
			};
		}

		isLoading = false;
	}

	async function handleLogout() {
		await organizationAuthActions.logout();
		goto("/login");
	}

	function handleToggleAvatarMenu() {
		showAvatarMenu = !showAvatarMenu;
	}

	function handleToggleNotifications() {
		showNotifications = !showNotifications;
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest(".avatar-menu-container")) {
			showAvatarMenu = false;
		}
		if (!target.closest(".notifications-container")) {
			showNotifications = false;
		}
	}

	function handleSettings() {
		// Navigate to settings page when implemented
		console.log("Settings clicked");
		showAvatarMenu = false;
	}

	onMount(async () => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 10;
		};
		window.addEventListener("scroll", handleScroll);

		await loadData();

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	});
</script>

<div class="min-h-screen bg-black">
	<AppHeader
		bind:isScrolled
		bind:showAvatarMenu
		bind:showNotifications
		{pendingUsers}
		onToggleAvatarMenu={handleToggleAvatarMenu}
		onToggleNotifications={handleToggleNotifications}
		onUpdatePendingUsers={loadData}
		onSettings={handleSettings}
		onLogout={handleLogout}
		onClickOutside={handleClickOutside}
	/>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-24">
		{#if organization}
			<div class="mb-8">
				<h2 class="text-3xl font-bold text-white mb-2">
					Olá, {organization.name}!
				</h2>
				<p class="text-white/70">Painel de gerenciamento</p>
			</div>
		{/if}

		{#if isLoading}
			<Loading message="Carregando dados..." />
		{:else}
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				<StatsCard title="Total de Usuários" value={stats.total_users}>
					{#snippet icon()}
						<Users
							class="w-10 h-10 text-blue-400"
							stroke-width={1.5}
						/>
					{/snippet}
				</StatsCard>
				<StatsCard
					title="Usuários Ativos"
					value={stats.active_users}
					variant="success"
				>
					{#snippet icon()}
						<UserCheck
							class="w-10 h-10 text-green-400"
							stroke-width={1.5}
						/>
					{/snippet}
				</StatsCard>
			</div>

			<!-- Novidades Section -->
			<div class="glass-card">
				<div class="px-6 py-5 border-b border-white/10">
					<div class="flex items-center gap-3">
						<Megaphone
							class="w-6 h-6 text-primary-400"
							stroke-width={2}
						/>
						<h2 class="text-xl font-bold text-white">Novidades</h2>
					</div>
				</div>

				{#if novidades.length === 0}
					<div class="p-16 text-center">
						<Megaphone
							class="w-12 h-12 text-white/40 mx-auto mb-3"
							stroke-width={1.5}
						/>
						<p class="text-white/70">Nenhuma novidade no momento</p>
					</div>
				{:else}
					<div class="p-6 space-y-4">
						{#each novidades as novidade (novidade.id)}
							<div
								class="glass-card p-5 hover:bg-white/10 transition-colors relative group"
							>
								<button
									onclick={() => removeNovidade(novidade.id)}
									class="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
									aria-label="Remover novidade"
								>
									<X class="w-4 h-4" />
								</button>

								<div class="flex items-start gap-4">
									<div
										class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 {novidade.color ===
										'primary'
											? 'bg-primary-600/20'
											: novidade.color === 'blue'
												? 'bg-blue-600/20'
												: novidade.color === 'green'
													? 'bg-green-600/20'
													: 'bg-primary-600/20'}"
									>
										{#if novidade.icon === "megaphone"}
											<Megaphone
												class="w-6 h-6 {novidade.color ===
												'primary'
													? 'text-primary-400'
													: novidade.color === 'blue'
														? 'text-blue-400'
														: novidade.color ===
															  'green'
															? 'text-green-400'
															: 'text-primary-400'}"
												stroke-width={2}
											/>
										{:else if novidade.icon === "users"}
											<Users
												class="w-6 h-6 {novidade.color ===
												'primary'
													? 'text-primary-400'
													: novidade.color === 'blue'
														? 'text-blue-400'
														: novidade.color ===
															  'green'
															? 'text-green-400'
															: 'text-primary-400'}"
												stroke-width={2}
											/>
										{:else if novidade.icon === "check"}
											<UserCheck
												class="w-6 h-6 {novidade.color ===
												'primary'
													? 'text-primary-400'
													: novidade.color === 'blue'
														? 'text-blue-400'
														: novidade.color ===
															  'green'
															? 'text-green-400'
															: 'text-primary-400'}"
												stroke-width={2}
											/>
										{/if}
									</div>
									<div class="flex-1 pr-8">
										<h3
											class="text-white font-semibold text-lg mb-1"
										>
											{novidade.title}
										</h3>
										<p class="text-white/70 text-sm mb-2">
											{novidade.description}
										</p>
										<div
											class="flex items-center gap-2 text-xs text-white/50"
										>
											<Calendar class="w-4 h-4" />
											<span
												>{new Date(
													novidade.created_at,
												).toLocaleDateString(
													"pt-BR",
												)}</span
											>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>
