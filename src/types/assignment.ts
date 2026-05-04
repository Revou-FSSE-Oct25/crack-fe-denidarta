export interface Assignment {
	id: number;
	course_id: number;
	title: string;
	description: string | null;
	due_date: string;
	max_points: number;
	status: "draft" | "published" | "closed";
	created_at: string;
	updated_at: string;
}

export interface AssignmentSubmission {
	id: number;
	assignment_id: number;
	user_id: number;
	submission_text: string | null;
	file_url: string | null;
	submitted_at: string | null;
	grade: number | null;
	passed: boolean;
	feedback: string | null;
	status: "draft" | "submitted" | "graded" | "returned";
	created_at: string;
	updated_at: string;
}
