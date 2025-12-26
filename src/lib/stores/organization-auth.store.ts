import { writable, derived } from 'svelte/store';
import { organizationsApi } from '$lib/api/organizations.api';
import type {
	Organization,
	OrganizationSession,
	RegisterOrganizationData,
	LoginOrganizationData
} from '$lib/types/organization';

interface OrganizationAuthState {
	organization: Organization | null;
	session: OrganizationSession | null;
	loading: boolean;
	error: string | null;
}

const initialState: OrganizationAuthState = {
	organization: null,
	session: null,
	loading: false,
	error: null
};

export const organizationAuthStore = writable<OrganizationAuthState>(initialState);

export const currentOrganization = derived(organizationAuthStore, ($state) => $state.organization);
export const isAuthenticated = derived(organizationAuthStore, ($state) => !!$state.session);
export const isLoading = derived(organizationAuthStore, ($state) => $state.loading);
export const authError = derived(organizationAuthStore, ($state) => $state.error);

export const organizationAuthActions = {
	async register(data: RegisterOrganizationData) {
		organizationAuthStore.update((state) => ({ ...state, loading: true, error: null }));

		const response = await organizationsApi.register(data);

		if (response.success && response.data) {
			const { organization } = response.data;

			organizationAuthStore.update(() => ({
				organization,
				session: response.data!,
				loading: false,
				error: null
			}));

			return { success: true };
		} else {
			organizationAuthStore.update((state) => ({
				...state,
				loading: false,
				error: response.error?.message || 'Cadastro falhou'
			}));

			return { success: false, error: response.error?.message };
		}
	},

	async login(data: LoginOrganizationData) {
		organizationAuthStore.update((state) => ({ ...state, loading: true, error: null }));

		const response = await organizationsApi.login(data);

		if (response.success && response.data) {
			const { organization } = response.data;

			organizationAuthStore.update(() => ({
				organization,
				session: response.data!,
				loading: false,
				error: null
			}));

			return { success: true };
		} else {
			organizationAuthStore.update((state) => ({
				...state,
				loading: false,
				error: response.error?.message || 'Login falhou'
			}));

			return { success: false, error: response.error?.message };
		}
	},

	async logout() {
		organizationAuthStore.update((state) => ({ ...state, loading: true }));

		await organizationsApi.logout();

		organizationAuthStore.set(initialState);

		return { success: true };
	},

	forceLogout() {
		organizationAuthStore.set(initialState);
	},

	async checkSession() {
		organizationAuthStore.update((state) => ({ ...state, loading: true }));

		const response = await organizationsApi.getProfile();

		if (response.success && response.data?.organization) {
			const organization = response.data.organization;
			organizationAuthStore.update(() => ({
				organization,
				session: { organization },
				loading: false,
				error: null
			}));

			return { success: true };
		} else {
			organizationAuthStore.set(initialState);
			return { success: false };
		}
	},

	clearError() {
		organizationAuthStore.update((state) => ({ ...state, error: null }));
	}
};
