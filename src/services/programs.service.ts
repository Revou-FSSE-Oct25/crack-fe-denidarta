import { apiFetch } from "@/lib/api-client";
import type { Program } from "@/types/index.type";

interface ApiResponse<T> {
	data: T;
}

interface Paginated<T> {
	data: T[];
	meta: { total: number };
}

export async function fetchPrograms(
	page: number,
	limit: number,
): Promise<Paginated<Program>> {
	const params = new URLSearchParams({ page: String(page), limit: String(limit) });
	const res = await apiFetch(`/programs?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch programs (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<Program> };
	return data;
}

export async function fetchAllPrograms(): Promise<Program[]> {
	const res = await apiFetch("/programs?limit=100");
	if (!res.ok) throw new Error("Failed to fetch programs");
	const { data } = (await res.json()) as { data: Paginated<Program> };
	return data.data ?? [];
}

export async function createProgram(
	name: string,
	createdBy: string,
	headOfProgramId?: string,
): Promise<Program> {
	const body: { name: string; createdBy: string; headOfProgramId?: string } = {
		name,
		createdBy,
	};
	if (headOfProgramId) {
		body.headOfProgramId = headOfProgramId;
	}
	const res = await apiFetch("/programs", {
		method: "POST",
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const err = (await res.json()) as { message?: string };
		throw new Error(err.message ?? "Failed to create program");
	}
	const json = (await res.json()) as ApiResponse<Program>;
	return json.data;
}

export async function fetchProgram(id: string): Promise<Program> {
	const res = await apiFetch(`/programs/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch program (${res.status})`);
	const { data } = (await res.json()) as ApiResponse<{ data: Program }>;
	return data.data;
}
