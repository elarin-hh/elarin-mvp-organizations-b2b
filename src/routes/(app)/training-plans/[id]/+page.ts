import type { PageLoad } from './$types';
import { organizationsApi } from '$lib/api/organizations.api';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const planId = Number(params.id);
	if (Number.isNaN(planId)) {
		throw error(400, 'ID de plano invalido');
	}

	const [planResponse, templatesResponse] = await Promise.all([
		organizationsApi.getTrainingPlan(planId),
		organizationsApi.getExerciseTemplates()
	]);

	if (!planResponse.success) {
		const statusCode = Number(planResponse.error?.code || 500);
		const message =
			planResponse.error?.message || 'Falha ao carregar plano de treino';
		throw error(statusCode, message);
	}

	if (!planResponse.data) {
		throw error(404, 'Plano nao encontrado');
	}

	return {
		plan: planResponse.data,
		templates: templatesResponse.success ? templatesResponse.data : []
	};
};
