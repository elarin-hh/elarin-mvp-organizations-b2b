

export interface ExerciseTemplate {
	id: number;
	type: string;
	name: string;
	description?: string;
	image_url?: string;
	video_url?: string;
	is_active: boolean;
	config?: Record<string, any>;
	editable_fields?: string[];
	created_at: string;
	updated_at: string;
}

export interface UserExercise {
	id: number;
	user_id: number;
	type: string;
	name: string;
	is_active: boolean;
	template_id: number | null;
	config?: Record<string, any>;
	created_at: string;
}

export interface AssignExerciseData {
	template_id: number;
}
