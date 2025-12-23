import type { PageLoad } from './$types';
import { organizationsApi } from '$lib/api/organizations.api';

export const load: PageLoad = async () => {
	const response = await organizationsApi.getTrainingPlans();

	if (!response.success) {
		const errorMessage =
			response.error?.message || 'Falha ao carregar planos de treino';
		return { plans: [], errorMessage };
	}

	return { plans: response.data, errorMessage: '' };
};
