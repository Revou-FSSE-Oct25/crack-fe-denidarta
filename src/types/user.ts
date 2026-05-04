export type UserRole = "student" | "instructor" | "admin";

export interface User {
	id: string;
	username: string;
	email: string;
	role: UserRole;
	status: string;
	createdAt: string;
}
