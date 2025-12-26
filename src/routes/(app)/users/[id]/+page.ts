import type { PageLoad } from './$types';
import { organizationsApi } from '$lib/api/organizations.api';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
        throw error(400, 'ID de usuário inválido');
    }

    try {
        const [userResponse, exercisesResponse, templatesResponse, plansResponse, assignmentResponse] = await Promise.all([
            organizationsApi.getMember(userId),
            organizationsApi.getUserExercises(userId),
            organizationsApi.getExerciseTemplates(),
            organizationsApi.getTrainingPlans(),
            organizationsApi.getUserTrainingPlans(userId)
        ]);

        if (!userResponse.success || !userResponse.data) {
            throw error(404, 'Usuário não encontrado');
        }

        return {
            user: userResponse.data,
            exercises: exercisesResponse.success ? exercisesResponse.data : [],
            templates: templatesResponse.success ? templatesResponse.data : [],
            trainingPlans: plansResponse.success ? plansResponse.data : [],
            assignedTrainingPlans: assignmentResponse.success ? assignmentResponse.data || [] : []
        };
    } catch (e) {
        console.error('Erro ao carregar detalhes do usuário:', e);
        throw error(500, 'Erro ao carregar detalhes do usuário');
    }
};
