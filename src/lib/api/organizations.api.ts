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

/**
 * Organizations API - Authentication and management endpoints
 * Backend endpoints: /organizations/*
 */
export const organizationsApi = {
	/**
	 * Register a new organization
	 * POST /organizations/auth/register
	 */
	async register(data: RegisterOrganizationData): Promise<ApiResponse<OrganizationSession>> {
		return restClient.post<OrganizationSession>('/organizations/auth/register', data);
	},

	/**
	 * Login organization
	 * POST /organizations/auth/login
	 */
	async login(data: LoginOrganizationData): Promise<ApiResponse<OrganizationSession>> {
		return restClient.post<OrganizationSession>('/organizations/auth/login', data);
	},

	/**
	 * Logout organization
	 * POST /organizations/auth/logout
	 */
	async logout(): Promise<ApiResponse<{ message: string }>> {
		return restClient.post<{ message: string }>('/organizations/auth/logout', null);
	},

	/**
	 * Get current organization profile
	 * GET /organizations/profile
	 */
	async getProfile(): Promise<ApiResponse<Organization>> {
		return restClient.get<Organization>('/organizations/profile');
	},

	/**
	 * Get users linked to organization
	 * GET /organizations/users
	 */
	async getUsers(): Promise<ApiResponse<OrganizationUser[]>> {
		return restClient.get<OrganizationUser[]>('/organizations/users');
	},

	/**
	 * Toggle user status (active/inactive)
	 * PATCH /organizations/users/:userId/toggle
	 */
	async toggleUserStatus(userId: number): Promise<ApiResponse<OrganizationUser>> {
		return restClient.patch<OrganizationUser>(`/organizations/users/${userId}/toggle`, {});
	},

	/**
	 * Remove user from organization
	 * DELETE /organizations/users/:userId
	 */
	async removeUser(userId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(`/organizations/users/${userId}`);
	},

	/**
	 * Get organization statistics
	 * GET /organizations/users/stats
	 */
	async getStats(): Promise<ApiResponse<OrganizationStats>> {
		return restClient.get<OrganizationStats>('/organizations/users/stats');
	},

	/**
	 * Get pending users waiting for approval
	 * GET /organizations/users/pending
	 */
	async getPendingUsers(): Promise<ApiResponse<OrganizationUser[]>> {
		return restClient.get<OrganizationUser[]>('/organizations/users/pending');
	},

	/**
	 * Approve a pending user
	 * PATCH /organizations/users/:userId/approve
	 */
	async approveUser(userId: number): Promise<ApiResponse<OrganizationUser>> {
		return restClient.patch<OrganizationUser>(`/organizations/users/${userId}/approve`);
	},

	/**
	 * Reject a pending user
	 * DELETE /organizations/users/:userId/reject
	 */
	async rejectUser(userId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(`/organizations/users/${userId}/reject`);
	},

	// ==================== Exercise Management ====================

	/**
	 * Get all available exercise templates
	 * GET /organizations/exercise-templates
	 */
	async getExerciseTemplates(): Promise<ApiResponse<any[]>> {
		return restClient.get<any[]>('/organizations/exercise-templates');
	},

	/**
	 * Get exercises assigned to a specific user
	 * GET /organizations/users/:userId/exercises
	 */
	async getUserExercises(userId: number): Promise<ApiResponse<any[]>> {
		return restClient.get<any[]>(`/organizations/users/${userId}/exercises`);
	},

	/**
	 * Assign an exercise to a user
	 * POST /organizations/users/:userId/exercises
	 */
	async assignExercise(userId: number, templateId: number): Promise<ApiResponse<any>> {
		return restClient.post<any>(`/organizations/users/${userId}/exercises`, { template_id: templateId });
	},

	/**
	 * Remove an exercise from a user
	 * DELETE /organizations/users/:userId/exercises/:exerciseId
	 */
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

	// ==================== Training Plans ====================

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

	// ==================== User Creation ====================

	/**
	 * Create a new user and link to organization
	 * POST /auth/register-with-organization
	 */
	async createUser(data: {
		email: string;
		password: string;
		full_name: string;
		birth_date: string;
		locale?: string;
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
