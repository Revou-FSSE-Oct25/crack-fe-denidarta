import { apiFetch } from "@/lib/api-client";
import type { Assignment } from "@/types/index.type";

interface Paginated<T> {
	data: T[];
	meta: { total: number };
}

export async function fetchAssignments(
	page: number,
	limit: number,
): Promise<Paginated<Assignment>> {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	const res = await apiFetch(`/assignments?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch assignments (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<Assignment> };
	return data;
}

export async function fetchAssignmentById(id: string): Promise<Assignment> {
	const res = await apiFetch(`/assignments/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch assignment (${res.status})`);
	const json = (await res.json()) as {
		data: { data: Assignment } | Assignment;
	};
	if ("data" in json.data && !Array.isArray(json.data.data)) {
		return json.data.data;
	}
	return json.data as Assignment;
}

export async function fetchStudentAssignments(
	page: number,
	limit: number,
): Promise<Paginated<Assignment>> {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	const res = await apiFetch(`/assignments/student?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch assignments (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<Assignment> };
	return data;
}

export async function fetchMyAssignments(): Promise<Assignment[]> {
	const res = await apiFetch("/assignments?limit=100");
	if (!res.ok) throw new Error(`Failed to fetch assignments (${res.status})`);
	const json = await res.json();
	const data = json.data?.data ?? json.data;
	return Array.isArray(data) ? data : [];
}

export async function gradeSubmission(
	submissionId: string,
	payload: { feedback: string; checkedCriteria: string[] },
): Promise<void> {
	const res = await apiFetch(`/submissions/${submissionId}/grade`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`Failed to grade submission (${res.status})`);
}

interface AssignmentPayload {
	courseId: string;
	title: string;
	description: string;
	dueDate: string;
	minPoints: number;
	status: string;
	gradingCriteria: { label: string; description?: string; points: number }[];
}

export async function createAssignment(
	payload: AssignmentPayload,
): Promise<Assignment> {
	const res = await apiFetch("/assignments", {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const err = (await res.json()) as { message?: string };
		throw new Error(err.message ?? "Failed to create assignment");
	}
	const json = (await res.json()) as {
		data: { data: Assignment } | Assignment;
	};
	if ("data" in json.data && !Array.isArray(json.data.data)) {
		return json.data.data;
	}
	return json.data as Assignment;
}

export async function updateAssignment(
	id: string,
	payload: Partial<AssignmentPayload>,
): Promise<Assignment> {
	const res = await apiFetch(`/assignments/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const err = (await res.json()) as { message?: string };
		throw new Error(err.message ?? "Failed to update assignment");
	}
	const json = (await res.json()) as {
		data: { data: Assignment } | Assignment;
	};
	if ("data" in json.data && !Array.isArray(json.data.data)) {
		return json.data.data;
	}
	return json.data as Assignment;
}
