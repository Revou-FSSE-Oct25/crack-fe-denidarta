import { apiFetch } from "@/lib/api-client";
import type { ProgramEnrollment } from "@/types/program";

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
