import { apiFetch } from "@/lib/api-client";
import type { Program } from "@/types/index.type";

interface ApiResponse<T> {
	data: T;
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
