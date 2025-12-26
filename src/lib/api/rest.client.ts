const API_BASE_URL = 'http://localhost:3001';

import type { ApiResponse } from '$lib/types/api';

class RestClient {
	private baseUrl: string;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl;
	}

	private unauthorizedHandler: ((context: { endpoint: string; status: number; message?: string }) => void) | null =
		null;

	setUnauthorizedHandler(
		handler: ((context: { endpoint: string; status: number; message?: string }) => void) | null
	) {
		this.unauthorizedHandler = handler;
	}

	private isAuthEndpoint(endpoint: string): boolean {
		return (
			endpoint.startsWith('/organizations/auth/login') ||
			endpoint.startsWith('/organizations/auth/register') ||
			endpoint.startsWith('/organizations/auth/logout')
		);
	}

	private async fetchWithErrorHandling<T>(
		endpoint: string,
		options?: RequestInit
	): Promise<ApiResponse<T>> {
		try {
			const headers: Record<string, string> = {};

			if (options?.body) {
				headers['Content-Type'] = 'application/json';
			}

			if (options?.headers) {
				Object.assign(headers, options.headers);
			}

			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				...options,
				headers,
				credentials: 'include'
			});

			let data: any = null;
			try {
				data = await response.json();
			} catch {
				data = null;
			}

			if (!response.ok) {
				const message = data?.message || data?.error || `Erro HTTP ${response.status}`;
				if (
					response.status === 401 &&
					!this.isAuthEndpoint(endpoint) &&
					this.unauthorizedHandler
				) {
					this.unauthorizedHandler({ endpoint, status: response.status, message });
				}

				return {
					success: false,
					error: {
						message,
						code: data.statusCode?.toString() || response.status.toString()
					}
				};
			}

			return {
				success: true,
				data
			};
		} catch (error) {
			return {
				success: false,
				error: {
					message: error instanceof Error ? error.message : 'Erro desconhecido',
					code: 'NETWORK_ERROR'
				}
			};
		}
	}

	async get<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.fetchWithErrorHandling<T>(endpoint, { method: 'GET' });
	}

	async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
		return this.fetchWithErrorHandling<T>(endpoint, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined
		});
	}

	async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
		return this.fetchWithErrorHandling<T>(endpoint, {
			method: 'PATCH',
			body: body ? JSON.stringify(body) : undefined
		});
	}

	async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.fetchWithErrorHandling<T>(endpoint, { method: 'DELETE' });
	}
}

export const restClient = new RestClient();

export const setUnauthorizedHandler = (
	handler: ((context: { endpoint: string; status: number; message?: string }) => void) | null
) => restClient.setUnauthorizedHandler(handler);
