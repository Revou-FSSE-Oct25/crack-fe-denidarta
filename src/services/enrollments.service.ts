import { apiFetch } from "@/lib/api-client";
import type { ProgramEnrollment } from "@/types/program";
import type { Program } from "@/types/program";

interface ApiResponse<T> {
	data: T;
}

export async function enrollStudent(
	programId: string,
	userId: string,
): Promise<ProgramEnrollment> {
	const res = await apiFetch("/enrollments", {
		method: "POST",
		body: JSON.stringify({ programId, userId, status: "enrolled" }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { message?: string };
		throw new Error(err.message ?? "Failed to enroll student");
	}
	const json = (await res.json()) as ApiResponse<ProgramEnrollment>;
	return json.data;
}

export interface MyEnrollment {
	id: string;
	programId: string;
	userId: string;
	status: "pending" | "enrolled" | "completed" | "dropped";
	createdAt?: string;
	user?: {
		id: string;
		username: string;
	};
	program: {
		id?: string;
		name: string;
		headOfProgram?: { userId: string; fullName: string | null } | null;
		courses?: {
			courseId?: string;
			id?: string;
			courseTitle?: string;
			name?: string;
			instructor?: {
				userId: string;
				fullName: string | null;
			};
			startedAt?: string | null;
			endedAt?: string | null;
			status?: string;
		}[];
	};
}

export async function fetchMyEnrollments(): Promise<MyEnrollment[]> {
	const { getCurrentUserId } = await import("@/utils/auth");
	const userId = getCurrentUserId();
	if (!userId) throw new Error("Not authenticated");
	const res = await apiFetch(`/enrollments/user/${userId}`);
	if (!res.ok) throw new Error(`Failed to fetch enrollments (${res.status})`);
	const json = (await res.json()) as { data: { data: MyEnrollment[] } };
	return Array.isArray(json.data?.data) ? json.data.data : [];
}
