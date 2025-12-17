import { restClient } from './rest.client';
import type { Notification, CreateNotificationData } from '$lib/types/notification';
import type { ApiResponse } from '$lib/types/api';

/**
 * Notifications API - Manage organization notifications
 * Backend endpoints: /organizations/notifications/*
 */
export const notificationsApi = {
	/**
	 * Get active notifications for current organization
	 * GET /organizations/notifications
	 */
	async getNotifications(): Promise<ApiResponse<Notification[]>> {
		return restClient.get<Notification[]>('/organizations/notifications');
	},

	/**
	 * Get all notifications (admin)
	 * GET /organizations/notifications/all
	 */
	async getAllNotifications(): Promise<ApiResponse<Notification[]>> {
		return restClient.get<Notification[]>('/organizations/notifications/all');
	},

	/**
	 * Create a new notification (admin)
	 * POST /organizations/notifications
	 */
	async createNotification(data: CreateNotificationData): Promise<ApiResponse<Notification>> {
		return restClient.post<Notification>('/organizations/notifications', data);
	},

	/**
	 * Delete a notification (admin)
	 * DELETE /organizations/notifications/:id
	 */
	async deleteNotification(notificationId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(`/organizations/notifications/${notificationId}`);
	},

	/**
	 * Toggle notification active status (admin)
	 * PATCH /organizations/notifications/:id/toggle
	 */
	async toggleNotificationStatus(notificationId: number): Promise<ApiResponse<Notification>> {
		return restClient.patch<Notification>(`/organizations/notifications/${notificationId}/toggle`);
	}
};
