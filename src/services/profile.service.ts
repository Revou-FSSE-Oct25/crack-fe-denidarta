import { apiFetch } from "@/lib/api-client";
import type { Profile, ProfileFormValues } from "@/types/index.type";

interface ApiResponse<T> {
	data: T;
}

export async function getProfileByUserId(userId: string): Promise<Profile> {
	const res = await apiFetch(`/profiles/users/${userId}`);
	if (!res.ok) {
		const err = (await res.json()) as { message?: string };
		throw new Error(err.message ?? "Failed to fetch profile");
	}
	const json = (await res.json()) as ApiResponse<Profile>;
	return json.data;
}

export async function upsertProfileByUserId(
	userId: string,
	payload: ProfileFormValues,
): Promise<Profile> {
	const res = await apiFetch(`/profiles/users/${userId}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const err = (await res.json()) as { message?: string };
		throw new Error(err.message ?? "Failed to save profile");
	}
	const json = (await res.json()) as ApiResponse<Profile>;
	return json.data;
}

export async function getCurrentUser(): Promise<{ id: string; email: string; role: string }> {
	const res = await apiFetch("/auth/me");
	if (!res.ok) {
		throw new Error("Failed to fetch current user");
	}
	const json = (await res.json()) as ApiResponse<{ id: string; email: string; role: string }>;
	return json.data;
}
