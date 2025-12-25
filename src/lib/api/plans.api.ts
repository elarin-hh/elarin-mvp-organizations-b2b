import { restClient } from './rest.client';
import type { Plan } from '$lib/types/plan';
import type { ApiResponse } from '$lib/types/api';


export const plansApi = {

	async getAllActivePlans(): Promise<ApiResponse<Plan[]>> {
		return restClient.get<Plan[]>('/plans');
	}
};
