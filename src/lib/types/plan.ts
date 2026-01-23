

export interface PlanFeatures {
	features: string[];
}

export interface Plan {
	id: number;
	name: string;
	active_users_limit: number;
	features: PlanFeatures;
	price_cents: number;
	is_active: boolean;
	created_at: string;
}

export interface PlanDisplay extends Plan {
	price_formatted: string;
	features_list: string[];
}
