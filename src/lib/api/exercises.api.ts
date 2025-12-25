import { restClient } from './rest.client';
import type { ExerciseTemplate, UserExercise, AssignExerciseData } from '$lib/types/exercise';
import type { ApiResponse } from '$lib/types/api';


export const exercisesApi = {

	async getTemplates(): Promise<ApiResponse<ExerciseTemplate[]>> {
		return restClient.get<ExerciseTemplate[]>('/organizations/exercise-templates');
	},


	async getUserExercises(userId: number): Promise<ApiResponse<UserExercise[]>> {
		return restClient.get<UserExercise[]>(`/organizations/users/${userId}/exercises`);
	},


	async assignExercise(
		userId: number,
		data: AssignExerciseData
	): Promise<ApiResponse<UserExercise>> {
		return restClient.post<UserExercise>(`/organizations/users/${userId}/exercises`, data);
	},


	async removeExercise(
		userId: number,
		exerciseId: number
	): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(
			`/organizations/users/${userId}/exercises/${exerciseId}`
		);
	}
};
