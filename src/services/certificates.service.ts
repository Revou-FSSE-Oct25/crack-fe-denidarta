import { apiFetch } from "@/lib/api-client";
import type { Certificate } from "@/types/index.type";

interface Paginated<T> {
	data: T[];
	meta: { total: number };
}

export async function fetchAllCertificates(): Promise<Certificate[]> {
	const res = await apiFetch("/certificates");
	if (!res.ok) throw new Error(`Failed to fetch certificates (${res.status})`);
	const body = (await res.json()) as { data: Certificate[] };
	return Array.isArray(body.data) ? body.data : [];
}

export async function fetchMyCertificates(): Promise<Certificate[]> {
	const res = await apiFetch("/certificates/my");
	if (!res.ok) throw new Error(`Failed to fetch certificates (${res.status})`);
	const { data } = (await res.json()) as { data: Certificate[] };
	return Array.isArray(data) ? data : [];
}

export async function fetchCertificates(
	page: number,
	limit: number,
): Promise<Paginated<Certificate>> {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	const res = await apiFetch(`/certificates?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch certificates (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<Certificate> };
	return data;
}

export async function fetchStudentCertificates(
	page: number,
	limit: number,
): Promise<Paginated<Certificate>> {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	const res = await apiFetch(`/certificates/student?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch certificates (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<Certificate> };
	return data;
}
