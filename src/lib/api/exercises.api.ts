import { restClient } from './rest.client';
import type { ExerciseTemplate, UserExercise, AssignExerciseData } from '$lib/types/exercise';
import type { ApiResponse } from '$lib/types/api';

/**
 * Exercises API - Exercise template and user exercise management
 * Backend endpoints: /organizations/exercise-* and /organizations/users/:userId/exercises
 */
export const exercisesApi = {
	/**
	 * Get all available exercise templates
	 * GET /organizations/exercise-templates
	 */
	async getTemplates(): Promise<ApiResponse<ExerciseTemplate[]>> {
		return restClient.get<ExerciseTemplate[]>('/organizations/exercise-templates');
	},

	/**
	 * Get user's assigned exercises
	 * GET /organizations/users/:userId/exercises
	 */
	async getUserExercises(userId: number): Promise<ApiResponse<UserExercise[]>> {
		return restClient.get<UserExercise[]>(`/organizations/users/${userId}/exercises`);
	},

	/**
	 * Assign exercise template to user
	 * POST /organizations/users/:userId/exercises
	 */
	async assignExercise(
		userId: number,
		data: AssignExerciseData
	): Promise<ApiResponse<UserExercise>> {
		return restClient.post<UserExercise>(`/organizations/users/${userId}/exercises`, data);
	},

	/**
	 * Remove exercise from user
	 * DELETE /organizations/users/:userId/exercises/:exerciseId
	 */
	async removeExercise(
		userId: number,
		exerciseId: number
	): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(
			`/organizations/users/${userId}/exercises/${exerciseId}`
		);
	}
};
