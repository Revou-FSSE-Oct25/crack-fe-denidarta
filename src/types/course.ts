export interface Course {
	id: string;
	name: string;
	description: string | null;
	instructorId: string;
	instructor: {
		userId: string;
		profile: { fullName: string | null };
	};
	program?: {
		name: string;
	};
	status: "draft" | "active" | "archived" | "completed";
	startedAt: string | null;
	endedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CourseEnrollment {
	id: number;
	courseId: number;
	userId: number;
	status: "enrolled" | "completed" | "dropped" | "pending";
	createdAt: string;
	updatedAt: string;
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
	instructor?: {
		userId: string;
		profile: {
			fullName: string | null;
		};
	};
}

export interface ClassAttendance {
	id: string;
	classSessionId: string;
	userId: string;
	status: "present" | "absent" | "late" | "excused" | "unverified";
	isVerified: boolean;
	verifiedAt: string | null;
	createdAt: string;
	updatedAt: string;
	classSession?: {
		title: string;
		sessionDate: string;
	};
}
