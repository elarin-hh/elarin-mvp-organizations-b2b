import { restClient } from './rest.client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';


export interface ExerciseTemplate {
    id: number;
    type: string;
    name: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    fixed_config?: Record<string, any>;
    default_config?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface UpdateTemplateConfigPayload {
    default_config: Record<string, any>;
}

export interface UpdateUserExerciseConfigPayload {
    config: Record<string, any>;
}


export async function getExerciseTemplates() {
    return restClient.get<ExerciseTemplate[]>('/organizations/exercise-templates');
}


export async function getExerciseTemplate(templateId: number) {
    return restClient.get<ExerciseTemplate>(`/organizations/exercise-templates/${templateId}`);
}


export async function updateTemplateDefaultConfig(
    templateId: number,
    payload: UpdateTemplateConfigPayload
) {
    return restClient.patch<ExerciseTemplate>(
        `/organizations/exercise-templates/${templateId}/default-config`,
        payload
    );
}


export async function updateUserExerciseConfig(
    userId: number,
    exerciseId: number,
    payload: UpdateUserExerciseConfigPayload
) {
    return restClient.patch<any>(
        `/organizations/users/${userId}/exercises/${exerciseId}/config`,
        payload
    );
}
