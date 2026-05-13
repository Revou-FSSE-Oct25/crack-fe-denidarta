export interface Assignment {
	id: string;
	courseId: string;
	course: { name: string };
	title: string;
	description: string | null;
	dueDate: string;
	minPoints: string;
	submitted: number;
	toSubmit: number;
	status: "draft" | "published" | "closed";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
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
