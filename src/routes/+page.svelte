<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { organizationAuthActions } from '$lib/stores/organization-auth.store';
	import { Loading } from '$lib/components/common';

	onMount(async () => {
		const sessionCheck = await organizationAuthActions.checkSession();

		if (sessionCheck.success) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	});
</script>

<Loading message="Carregando..." />
