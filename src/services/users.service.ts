import { apiFetch } from "@/lib/api-client";
import type { User } from "@/types/index.type";

interface PaginatedResponse<T> {
	data: {
		data: T[];
		meta: { total: number };
	};
}

interface Paginated<T> {
	data: T[];
	meta: { total: number };
}

export async function fetchStudents(
	page: number,
	limit: number,
	search?: string,
	status?: string,
	sortBy?: "fullName" | "createdAt" | "email",
	sortOrder?: "asc" | "desc",
): Promise<Paginated<User>> {
	const params = new URLSearchParams({
		role: "student",
		page: String(page),
		limit: String(limit),
		...(search && { search }),
		...(status && status !== "all" && { status }),
		...(sortBy && { sortBy }),
		...(sortOrder && { sortOrder }),
	});
	const res = await apiFetch(`/users?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch students (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<User> };
	return data;
}

export async function createUser(payload: {
	username: string;
	email: string;
	role: string;
}): Promise<User> {
	const res = await apiFetch("/users", {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (res.status === 409) throw new Error("EMAIL_TAKEN");
	if (!res.ok) throw new Error("Failed to create user");
	const { data } = (await res.json()) as { data: { data: User } };
	return data.data;
}

export async function inviteUser(userId: string): Promise<string> {
	const res = await apiFetch(`/auth/invite/${userId}`, { method: "POST" });
	if (!res.ok) throw new Error("Failed to send invitation");
	const { data } = (await res.json()) as { data: { inviteToken: string } };
	return data.inviteToken;
}

export async function fetchAdminsAndInstructors(
	sortBy: "fullName" | "createdAt" | "email" = "fullName",
	sortOrder: "asc" | "desc" = "asc",
): Promise<User[]> {
	console.log("[users.service] fetching admins and instructors...");
	const params = new URLSearchParams({
		roles: "admin,instructor",
		limit: "100",
		...(sortBy && { sortBy }),
		...(sortOrder && { sortOrder }),
	});
	const res = await apiFetch(`/users?${params}`);
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

export async function fetchUser(id: string): Promise<User> {
	const res = await apiFetch(`/users/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch user (${res.status})`);
	const { data } = (await res.json()) as { data: { data: User } };
	return data.data;
}
