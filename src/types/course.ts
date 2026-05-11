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
	enrollments: CourseEnrollment[];
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
	id: string;
	title: string;
	content: string | null;
	fileUrl: string | null;
	materialType: "video" | "pdf" | "article" | "slides" | "other";
	orderIndex: number;
	createdAt: string;
	updatedAt: string;
	uploader: {
		id: string;
		username: string;
		profile: { fullName?: string } | null;
	};
}

export interface ClassSession {
	id: string;
	courseId: string;
	title: string;
	sessionDate: string;
	startTime: string;
	endTime: string;
	location: string | null;
	meetingUrl: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	status: "scheduled" | "ongoing" | "completed" | "cancelled";
	course?: {
		id: string;
		name: string;
	};
}

export interface ClassAttendance {
	id: number;
	class_session_id: number;
	user_id: number;
	status: "present" | "absent" | "late" | "excused";
	created_at: string;
	updated_at: string;
}
