export interface Notification {
	id: number;
	organization_id: number | null;
	title: string;
	description: string;
	icon: string;
	color: string;
	is_active: boolean;
	created_at: string;
	expires_at: string | null;
	updated_at: string;
}

export interface CreateNotificationData {
	organization_id?: number | null;
	title: string;
	description: string;
	icon?: string;
	color?: string;
	is_active?: boolean;
	expires_at?: string | null;
}
