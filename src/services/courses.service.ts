import { apiFetch } from "@/lib/api-client";
import type { Course } from "@/types/index.type";

interface Paginated<T> {
	data: T[];
	meta: { total: number };
}

export async function fetchCourses(
	page: number,
	limit: number,
): Promise<Paginated<Course>> {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	const res = await apiFetch(`/courses?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch courses (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<Course> };
	return data;
}

export async function fetchAllCourses(): Promise<Course[]> {
	const res = await apiFetch("/courses?limit=100");
	if (!res.ok) throw new Error("Failed to fetch courses");
	const { data } = (await res.json()) as { data: Paginated<Course> };
	return data.data ?? [];
}

export async function fetchStudentCourses(
	page: number,
	limit: number,
): Promise<Paginated<Course>> {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	const res = await apiFetch(`/courses/student?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch courses (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<Course> };
	return data;
}

interface CoursePayload {
	name: string;
	description: string;
	instructorId: string;
	programId: string;
	status: string;
	startedAt: string;
	endedAt: string;
}

export async function createCourse(payload: CoursePayload): Promise<Course> {
	const res = await apiFetch("/courses", {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const err = (await res.json()) as { message?: string };
		throw new Error(err.message ?? "Failed to create course");
	}
	const { data } = (await res.json()) as { data: Course };
	return data;
}

export async function fetchCourseById(id: string): Promise<Course> {
	const res = await apiFetch(`/courses/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch course (${res.status})`);
	const json = (await res.json()) as { data: { data: Course } | Course };
	// Handle potential double nesting from singleResponse + ResponseInterceptor
	if ("data" in json.data && !Array.isArray(json.data.data)) {
		return json.data.data;
	}
	return json.data as Course;
}
