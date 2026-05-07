import { apiFetch } from "@/lib/api-client";
import type { User } from "@/types/index.type";

interface PaginatedResponse<T> {
	data: {
		data: T[];
		meta: { total: number };
	};
}

export async function fetchAdminsAndInstructors(): Promise<User[]> {
	console.log("[users.service] fetching admins and instructors...");
	const res = await apiFetch("/users?roles=admin,instructor&limit=100");
	console.log("[users.service] response status:", res.status);
	if (!res.ok) {
		const errBody = await res.text();
		console.error("[users.service] error body:", errBody);
		throw new Error(`Failed to fetch users (${res.status})`);
	}
	const json = (await res.json()) as PaginatedResponse<User>;
	console.log("[users.service] data:", json);
	return json.data?.data ?? [];
}
