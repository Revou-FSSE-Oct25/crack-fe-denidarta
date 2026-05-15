export const programTableHeaders = [
	{ key: "name", header: "Program Name" },
	{ key: "creator", header: "Created By" },
	{ key: "courseCount", header: "Courses" },
	{ key: "enrolledStudents", header: "Enrolled Students" },
	{ key: "createdAt", header: "Created Date" },
	{ key: "action", header: "" },
] as const;

export const enrolledStudentHeaders = [
	{ key: "fullName", header: "Full Name" },
	{ key: "status", header: "Status" },
	{ key: "enrolledAt", header: "Enrolled At" },
] as const;

export const programCourseHeaders = [
	{ key: "courseTitle", header: "Course Title" },
	{ key: "instructor", header: "Instructor" },
] as const;
