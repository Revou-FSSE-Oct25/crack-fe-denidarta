export interface Course {
	id: string;
	name: string;
	description: string;
	instructor_id: string;
	instructor: {
		id: string;
		username: string;
		profile: { fullName: string | null } | null;
	};
	status: "draft" | "active" | "archived" | "completed";
	created_at: string;
	updated_at: string;
}

export interface CourseEnrollment {
	id: number;
	course_id: number;
	user_id: number;
	status: "enrolled" | "completed" | "dropped" | "pending";
	created_at: string;
	updated_at: string;
}

export interface LearningMaterial {
	id: number;
	course_id: number;
	title: string;
	content: string | null;
	file_url: string | null;
	material_type: "video" | "pdf" | "article" | "slides" | "other";
	order_index: number;
	created_at: string;
	updated_at: string;
}

export interface ClassSession {
	id: number;
	course_id: number;
	title: string;
	session_date: string;
	start_time: string;
	end_time: string;
	location: string | null;
	meeting_url: string | null;
	created_at: string;
	updated_at: string;
}

export interface ClassAttendance {
	id: number;
	class_session_id: number;
	user_id: number;
	status: "present" | "absent" | "late" | "excused";
	created_at: string;
	updated_at: string;
}
