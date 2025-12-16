<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentOrganization, organizationAuthActions } from '$lib/stores/organization-auth.store';
	import { organizationsApi } from '$lib/api/organizations.api';
	import { AppHeader, Loading } from '$lib/components/common';
	import StatsCard from '$lib/components/organization/StatsCard.svelte';
	import UsersList from '$lib/components/organization/UsersList.svelte';
	import type { OrganizationUser, OrganizationStats } from '$lib/types/organization';
	import Users from 'lucide-svelte/icons/users';
	import UserCheck from 'lucide-svelte/icons/user-check';
	import UserX from 'lucide-svelte/icons/user-x';

	const organization = $derived($currentOrganization);

	let users = $state<OrganizationUser[]>([]);
	let pendingUsers = $state<OrganizationUser[]>([]);
	let stats = $state<OrganizationStats>({ total_users: 0, active_users: 0, inactive_users: 0, pending_users: 0 });
	let isLoading = $state(true);
	let isScrolled = $state(false);
	let showAvatarMenu = $state(false);
	let showNotifications = $state(false);

	async function loadData() {
		isLoading = true;

		// Load all users (ACTIVE and INACTIVE)
		const usersResponse = await organizationsApi.getUsers();
		if (usersResponse.success && usersResponse.data) {
			// Filter ACTIVE and INACTIVE users
			users = usersResponse.data.filter(u => u.status === 'ACTIVE' || u.status === 'INACTIVE');
		}

		// Load pending users
		const pendingResponse = await organizationsApi.getPendingUsers();
		if (pendingResponse.success && pendingResponse.data) {
			pendingUsers = pendingResponse.data;
		}

		// Load stats
		const statsResponse = await organizationsApi.getStats();
		if (statsResponse.success && statsResponse.data) {
			stats = {
				...statsResponse.data,
				pending_users: pendingUsers.length
			};
		}

		isLoading = false;
	}

	async function handleLogout() {
		await organizationAuthActions.logout();
		goto('/login');
	}

	function handleToggleAvatarMenu() {
		showAvatarMenu = !showAvatarMenu;
	}

	function handleToggleNotifications() {
		showNotifications = !showNotifications;
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.avatar-menu-container')) {
			showAvatarMenu = false;
		}
		if (!target.closest('.notifications-container')) {
			showNotifications = false;
		}
	}

	function handleSettings() {
		console.log('Settings clicked');
		showAvatarMenu = false;
	}

	onMount(async () => {
		// Handle scroll effect for header
		const handleScroll = () => {
			isScrolled = window.scrollY > 10;
		};
		window.addEventListener('scroll', handleScroll);

		// Cleanup
		const cleanup = () => {
			window.removeEventListener('scroll', handleScroll);
		};

		// Check session
		const sessionCheck = await organizationAuthActions.checkSession();

		if (!sessionCheck.success) {
			goto('/login');
			return;
		}

		await loadData();

		return cleanup;
	});
</script>

<div class="min-h-screen bg-black">
	<AppHeader
		bind:isScrolled
		bind:showAvatarMenu
		bind:showNotifications
		pendingUsers={pendingUsers}
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
				<h2 class="text-3xl font-bold text-white mb-2">Gestão de Usuários</h2>
				<p class="text-white/70">Gerenciar todos os usuários da organização</p>
			</div>
		{/if}

		{#if isLoading}
			<Loading message="Carregando usuários..." />
		{:else}
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<StatsCard
					title="Total de Usuários"
					value={stats.total_users}
				>
					{#snippet icon()}
						<Users class="w-10 h-10 text-blue-400" stroke-width={1.5} />
					{/snippet}
				</StatsCard>
				<StatsCard
					title="Usuários Ativos"
					value={stats.active_users}
					variant="success"
				>
					{#snippet icon()}
						<UserCheck class="w-10 h-10 text-green-400" stroke-width={1.5} />
					{/snippet}
				</StatsCard>
				<StatsCard
					title="Usuários Inativos"
					value={stats.inactive_users}
					variant="muted"
				>
					{#snippet icon()}
						<UserX class="w-10 h-10 text-gray-400" stroke-width={1.5} />
					{/snippet}
				</StatsCard>
			</div>

			<!-- Users List -->
			<UsersList {users} onUpdate={loadData} />
		{/if}
	</main>
</div>
