<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import {
		currentOrganization,
		organizationAuthActions,
	} from "$lib/stores/organization-auth.store";
	import { organizationsApi } from "$lib/api/organizations.api";
	import { Loading } from "$lib/components/common";
	import StatsCard from "$lib/components/organization/StatsCard.svelte";
	import UsersList from "$lib/components/organization/UsersList.svelte";
	import type {
		OrganizationUser,
		OrganizationStats,
	} from "$lib/types/organization";
	import Users from "lucide-svelte/icons/users";
	import UserCheck from "lucide-svelte/icons/user-check";
	import UserX from "lucide-svelte/icons/user-x";
	import UserPlus from "lucide-svelte/icons/user-plus";

	const organization = $derived($currentOrganization);

	let users = $state<OrganizationUser[]>([]);
	let stats = $state<OrganizationStats>({
		total_users: 0,
		active_users: 0,
		inactive_users: 0,
		pending_users: 0,
	});
	let isLoading = $state(true);

	async function loadData() {
		isLoading = true;

		// Load all users (ACTIVE, INACTIVE and PENDING)
		const usersResponse = await organizationsApi.getUsers();
		if (usersResponse.success && usersResponse.data) {
			// Filter ACTIVE, INACTIVE and PENDING users
			users = usersResponse.data.filter(
				(u) =>
					u.status === "ACTIVE" ||
					u.status === "INACTIVE" ||
					u.status === "PENDING",
			);
		}

		// Load stats
		const statsResponse = await organizationsApi.getStats();
		if (statsResponse.success && statsResponse.data) {
			stats = statsResponse.data;
		}

		isLoading = false;
	}

	onMount(async () => {
		// Check session
		const sessionCheck = await organizationAuthActions.checkSession();

		if (!sessionCheck.success) {
			goto("/login");
			return;
		}

		await loadData();
	});
</script>

<div class="min-h-full">
	<!-- Main Content -->
	<main class="w-full min-h-full px-6 pb-8 pt-8">
		{#if isLoading}
			<Loading message="Carregando usuários..." />
		{:else}
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<StatsCard title="Total de Usuários" value={stats.total_users}>
					{#snippet icon()}
						<Users
							class="w-6 h-6"
							stroke-width={2}
							style="color: var(--color-primary-500);"
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
							class="w-6 h-6"
							stroke-width={2}
							style="color: var(--color-primary-500);"
						/>
					{/snippet}
				</StatsCard>
				<StatsCard
					title="Usuários Inativos"
					value={stats.inactive_users}
					variant="muted"
				>
					{#snippet icon()}
						<UserX
							class="w-6 h-6"
							stroke-width={2}
							style="color: var(--color-gray-300);"
						/>
					{/snippet}
				</StatsCard>
			</div>

			<!-- Header with Add Button -->
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold text-white">
					Gerenciar Usuários
				</h2>
				<button
					onclick={() => goto("/users/new")}
					class="px-4 py-2 bg-primary-500 text-white font-medium hover:bg-primary-600 active:bg-primary-700 transition-colors flex items-center gap-2 focus:outline-none"
					style="border-radius: var(--radius-md);"
				>
					<UserPlus size={18} />
					Cadastrar Usuário
				</button>
			</div>

			<!-- Users List -->
			<UsersList {users} onUpdate={loadData} />
		{/if}
	</main>
</div>
