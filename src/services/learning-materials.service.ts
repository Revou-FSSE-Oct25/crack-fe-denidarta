import { apiFetch } from "@/lib/api-client";
import type { Course, LearningMaterial } from "@/types/index.type";

interface Paginated<T> {
	data: T[];
	meta: { total: number };
}

export async function fetchLearningMaterials(
	page: number,
	limit: number,
): Promise<Paginated<LearningMaterial>> {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	const res = await apiFetch(`/learning-materials?${params}`);
	if (!res.ok)
		throw new Error(`Failed to fetch learning materials (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<LearningMaterial> };
	return data;
}

export async function fetchStudentLearningMaterials(
	page: number,
	limit: number,
): Promise<Paginated<LearningMaterial>> {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	const res = await apiFetch(`/learning-materials/student?${params}`);
	if (!res.ok)
		throw new Error(`Failed to fetch learning materials (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<LearningMaterial> };
	return data;
}

interface MaterialWithCourse extends LearningMaterial {
	courseName: string;
}

export async function fetchMyLearningMaterials(): Promise<
	MaterialWithCourse[]
> {
	const coursesRes = await apiFetch("/courses");
	if (!coursesRes.ok)
		throw new Error(`Failed to fetch courses (${coursesRes.status})`);
	const coursesJson = await coursesRes.json();
	const courses: Course[] = coursesJson.data?.data ?? coursesJson.data ?? [];

	const materialsByCourse = await Promise.all(
		courses.map(async (course) => {
			const res = await apiFetch(`/learning-materials/course/${course.id}`);
			if (!res.ok) return [];
			const json = await res.json();
			const data = json.data?.data ?? json.data;
			const items = Array.isArray(data) ? data : [];
			return items.map((m) => ({ ...m, courseName: course.name }));
		}),
	);

	return materialsByCourse.flat();
}
