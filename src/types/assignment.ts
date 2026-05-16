export interface Assignment {
	id: string;
	courseId: string;
	course: { name: string };
	title: string;
	description: string | null;
	dueDate: string;
	minPoints: number;
	submitted: number;
	toSubmit: number;
	status: "draft" | "published" | "closed";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	gradingCriteria?: { label: string; points: number; description: string }[];
	submissions?: {
		submissionId: string;
		userId: string;
		fullName: string | null;
		status: "notSubmitted" | "submitted" | "graded";
		dateSubmitted: string | null;
		grade: number | null;
		passed: boolean | null;
		feedback?: string | null;
		gradedAt: string | null;
	}[];
}

export interface SubmissionDetail {
	id: string;
	assignmentId: string;
	studentId: string;
	submissionText: string | null;
	fileUrl: string | null;
	submittedAt: string | null;
	grade: number | null;
	passed: boolean | null;
	feedback: string | null;
	status: "notSubmitted" | "submitted" | "graded";
	createdAt: string;
	updatedAt: string;
	student: { profile: { fullName: string | null } | null } | null;
	assignment: { id: string; title: string } | null;
}

export interface AssignmentSubmission {
	id: string;
	assignmentId: string;
	userId: string;
	userFullName?: string | null;
	submissionText: string | null;
	fileUrl: string | null;
	submittedAt: string | null;
	grade: number | null;
	passed: boolean;
	feedback: string | null;
	status: "notSubmitted" | "submitted" | "graded";
	createdAt: string;
	updatedAt: string;
	assignment?: { id: string; title: string } | null;
}
