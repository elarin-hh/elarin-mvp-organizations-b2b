export interface TrainingPlan {
	id: number;
	name: string;
	description?: string | null;
	is_active: boolean;
	created_at: string;
	updated_at?: string | null;
	items_count?: number;
	active_assignments?: number;
}

export interface TrainingPlanTemplateInfo {
	id: number;
	type: string;
	name?: string | null;
	name_pt?: string | null;
	is_active?: boolean | null;
}

export interface TrainingPlanItem {
	id: number;
	position: number;
	template_id: number;
	exercise_type?: string | null;
	target_reps?: number | null;
	target_duration_sec?: number | null;
	exercise_template?: TrainingPlanTemplateInfo | null;
}

export interface TrainingPlanDetails extends TrainingPlan {
	items: TrainingPlanItem[];
}

export interface TrainingPlanAssignment {
	id: number;
	plan_id: number;
	user_id: number;
	is_active: boolean;
	assigned_at?: string | null;
	plan?: {
		id: number;
		name?: string | null;
		description?: string | null;
		is_active?: boolean | null;
	};
}
