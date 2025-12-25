import { restClient } from './rest.client';
import { get } from 'svelte/store';
import { currentOrganization } from '$lib/stores/organization-auth.store';
import type {
	Organization,
	OrganizationSession,
	OrganizationUser,
	OrganizationStats,
	RegisterOrganizationData,
	LoginOrganizationData
} from '$lib/types/organization';
import type {
	TrainingPlan,
	TrainingPlanAssignment,
	TrainingPlanDetails,
	TrainingPlanItem
} from '$lib/types/training-plan';
import type { ApiResponse } from '$lib/types/api';


export const organizationsApi = {

	async register(data: RegisterOrganizationData): Promise<ApiResponse<OrganizationSession>> {
		return restClient.post<OrganizationSession>('/organizations/auth/register', data);
	},


	async login(data: LoginOrganizationData): Promise<ApiResponse<OrganizationSession>> {
		return restClient.post<OrganizationSession>('/organizations/auth/login', data);
	},


	async logout(): Promise<ApiResponse<{ message: string }>> {
		return restClient.post<{ message: string }>('/organizations/auth/logout', null);
	},


	async getProfile(): Promise<ApiResponse<Organization>> {
		return restClient.get<Organization>('/organizations/profile');
	},


	async getUsers(): Promise<ApiResponse<OrganizationUser[]>> {
		return restClient.get<OrganizationUser[]>('/organizations/users');
	},


	async toggleUserStatus(userId: number): Promise<ApiResponse<OrganizationUser>> {
		return restClient.patch<OrganizationUser>(`/organizations/users/${userId}/toggle`, {});
	},


	async removeUser(userId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(`/organizations/users/${userId}`);
	},


	async getStats(): Promise<ApiResponse<OrganizationStats>> {
		return restClient.get<OrganizationStats>('/organizations/users/stats');
	},


	async getPendingUsers(): Promise<ApiResponse<OrganizationUser[]>> {
		return restClient.get<OrganizationUser[]>('/organizations/users/pending');
	},


	async approveUser(userId: number): Promise<ApiResponse<OrganizationUser>> {
		return restClient.patch<OrganizationUser>(`/organizations/users/${userId}/approve`);
	},


	async rejectUser(userId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(`/organizations/users/${userId}/reject`);
	},




	async getExerciseTemplates(): Promise<ApiResponse<any[]>> {
		return restClient.get<any[]>('/organizations/exercise-templates');
	},


	async getUserExercises(userId: number): Promise<ApiResponse<any[]>> {
		return restClient.get<any[]>(`/organizations/users/${userId}/exercises`);
	},


	async assignExercise(userId: number, templateId: number): Promise<ApiResponse<any>> {
		return restClient.post<any>(`/organizations/users/${userId}/exercises`, { template_id: templateId });
	},


	async removeExercise(userId: number, exerciseId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(`/organizations/users/${userId}/exercises/${exerciseId}`);
	},

	async getMember(userId: number): Promise<ApiResponse<any>> {
		return restClient.get<any>(`/organizations/users/${userId}`);
	},

	async getExerciseConfig(userId: number, exerciseId: number): Promise<ApiResponse<any>> {
		return restClient.get<any>(`/organizations/users/${userId}/exercises/${exerciseId}/config`);
	},

	async updateExerciseConfig(userId: number, exerciseId: number, config: Record<string, any>): Promise<ApiResponse<any>> {
		return restClient.patch<any>(`/organizations/users/${userId}/exercises/${exerciseId}/config`, { config });
	},



	async getTrainingPlans(): Promise<ApiResponse<TrainingPlan[]>> {
		return restClient.get<TrainingPlan[]>('/organizations/training-plans');
	},

	async getTrainingPlan(planId: number): Promise<ApiResponse<TrainingPlanDetails>> {
		return restClient.get<TrainingPlanDetails>(`/organizations/training-plans/${planId}`);
	},

	async createTrainingPlan(payload: { name: string; description?: string | null }): Promise<ApiResponse<TrainingPlan>> {
		return restClient.post<TrainingPlan>('/organizations/training-plans', payload);
	},

	async updateTrainingPlan(planId: number, payload: { name?: string; description?: string | null; is_active?: boolean }): Promise<ApiResponse<TrainingPlan>> {
		return restClient.patch<TrainingPlan>(`/organizations/training-plans/${planId}`, payload);
	},

	async deactivateTrainingPlan(planId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.patch<{ message: string }>(`/organizations/training-plans/${planId}/deactivate`, {});
	},

	async removeTrainingPlan(planId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(`/organizations/training-plans/${planId}`);
	},

	async addTrainingPlanItem(planId: number, payload: {
		template_id: number;
		position?: number;
		target_reps?: number;
		target_duration_sec?: number;
	}): Promise<ApiResponse<TrainingPlanItem>> {
		return restClient.post<TrainingPlanItem>(`/organizations/training-plans/${planId}/items`, payload);
	},

	async updateTrainingPlanItem(planId: number, itemId: number, payload: {
		position?: number;
		target_reps?: number;
		target_duration_sec?: number;
	}): Promise<ApiResponse<TrainingPlanItem>> {
		return restClient.patch<TrainingPlanItem>(
			`/organizations/training-plans/${planId}/items/${itemId}`,
			payload
		);
	},

	async removeTrainingPlanItem(planId: number, itemId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(
			`/organizations/training-plans/${planId}/items/${itemId}`
		);
	},

	async reorderTrainingPlanItems(
		planId: number,
		itemIds: number[]
	): Promise<ApiResponse<TrainingPlanDetails>> {
		return restClient.patch<TrainingPlanDetails>(
			`/organizations/training-plans/${planId}/items/reorder`,
			{ item_ids: itemIds }
		);
	},

	async getUserTrainingPlans(userId: number): Promise<ApiResponse<TrainingPlanAssignment[]>> {
		return restClient.get<TrainingPlanAssignment[]>(
			`/organizations/users/${userId}/training-plans`
		);
	},

	async assignTrainingPlanToUser(userId: number, planId: number): Promise<ApiResponse<TrainingPlanAssignment>> {
		return restClient.post<TrainingPlanAssignment>(
			`/organizations/users/${userId}/training-plans`,
			{ plan_id: planId }
		);
	},

	async removeTrainingPlanFromUser(userId: number, planId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(
			`/organizations/users/${userId}/training-plans/${planId}`
		);
	},




	async createUser(data: {
		email: string;
		password: string;
		full_name: string;
		birth_date: string;
		marketing_consent?: boolean;
		height_cm?: number;
		weight_kg?: number;
	}): Promise<ApiResponse<any>> {
		const organization = get(currentOrganization);
		if (!organization) {
			return {
				success: false,
				error: {
					message: 'Organização não encontrada. Faça login novamente.',
					code: 'NO_ORGANIZATION'
				}
			};
		}

		return restClient.post<any>('/auth/register-with-organization', {
			...data,
			organization_id: organization.id
		});
	}
};
