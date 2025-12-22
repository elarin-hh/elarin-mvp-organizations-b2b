<script lang="ts">
	import { onMount } from "svelte";
	import { Loading } from "$lib/components/common";
	import { currentOrganization } from "$lib/stores/organization-auth.store";
	import { organizationsApi } from "$lib/api/organizations.api";
	import StatsCard from "$lib/components/organization/StatsCard.svelte";
	import type { OrganizationStats } from "$lib/types/organization";
	import Users from "lucide-svelte/icons/users";
	import UserCheck from "lucide-svelte/icons/user-check";

	const organization = $derived($currentOrganization);

	let stats = $state<OrganizationStats>({
		total_users: 0,
		active_users: 0,
		inactive_users: 0,
		pending_users: 0,
	});
	let isLoading = $state(true);

	async function loadData() {
		isLoading = true;

		const statsResponse = await organizationsApi.getStats();
		if (statsResponse.success && statsResponse.data) {
			stats = statsResponse.data;
		}

		isLoading = false;
	}

	onMount(async () => {
		await loadData();
	});
</script>

<div class="min-h-screen">
	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-20">
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
						<Users class="w-6 h-6 text-blue-400" stroke-width={2} />
					{/snippet}
				</StatsCard>
				<StatsCard
					title="Usuários Ativos"
					value={stats.active_users}
					variant="success"
				>
					{#snippet icon()}
						<UserCheck
							class="w-6 h-6 text-green-400"
							stroke-width={2}
						/>
					{/snippet}
				</StatsCard>
			</div>
		{/if}
	</main>
</div>
