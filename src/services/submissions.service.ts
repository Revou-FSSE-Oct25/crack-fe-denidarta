import { apiFetch } from "@/lib/api-client";
import type { AssignmentSubmission } from "@/types/index.type";

interface Paginated<T> {
	data: T[];
	meta: { total: number };
}

export async function fetchUserSubmissions(
	userId: string,
	page = 1,
	limit = 100,
): Promise<Paginated<AssignmentSubmission>> {
	const params = new URLSearchParams({
		studentId: userId,
		page: String(page),
		limit: String(limit),
	});
	const res = await apiFetch(`/submissions?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch submissions (${res.status})`);
	const { data } = (await res.json()) as {
		data: Paginated<AssignmentSubmission>;
	};
	return data;
}
