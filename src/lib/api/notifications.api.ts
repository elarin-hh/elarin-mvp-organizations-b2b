import { restClient } from './rest.client';
import type { Notification, CreateNotificationData } from '$lib/types/notification';
import type { ApiResponse } from '$lib/types/api';


export const notificationsApi = {

	async getNotifications(): Promise<ApiResponse<Notification[]>> {
		return restClient.get<Notification[]>('/organizations/notifications');
	},


	async getAllNotifications(): Promise<ApiResponse<Notification[]>> {
		return restClient.get<Notification[]>('/organizations/notifications/all');
	},


	async createNotification(data: CreateNotificationData): Promise<ApiResponse<Notification>> {
		return restClient.post<Notification>('/organizations/notifications', data);
	},


	async deleteNotification(notificationId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.delete<{ message: string }>(`/organizations/notifications/${notificationId}`);
	},


	async toggleNotificationStatus(notificationId: number): Promise<ApiResponse<Notification>> {
		return restClient.patch<Notification>(`/organizations/notifications/${notificationId}/toggle`);
	},


	async markAsRead(notificationId: number): Promise<ApiResponse<{ message: string }>> {
		return restClient.patch<{ message: string }>(`/organizations/notifications/${notificationId}/read`);
	}
};
