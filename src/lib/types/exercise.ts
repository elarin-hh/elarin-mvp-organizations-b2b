/**
 * Exercise Types
 * Based on backend API exercise endpoints
 */

export interface ExerciseTemplate {
	id: number;
	type: string;
	name: string;
	description?: string;
	is_active: boolean;
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
	created_at: string;
}

export interface AssignExerciseData {
	template_id: number;
}
