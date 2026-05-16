import { apiFetch } from "@/lib/api-client";
import type { ClassAttendance, ClassSession } from "@/types/index.type";

interface Paginated<T> {
	data: T[];
	meta: { total: number };
}

export async function fetchClassSessions(
	page: number,
	limit: number,
): Promise<Paginated<ClassSession>> {
	const params = new URLSearchParams({ page: String(page), limit: String(limit) });
	const res = await apiFetch(`/class-sessions?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch class sessions (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<ClassSession> };
	return data;
}

export async function fetchClassSessionById(id: string): Promise<ClassSession> {
	const res = await apiFetch(`/class-sessions/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch class session (${res.status})`);
	const json = (await res.json()) as { data: { data: ClassSession } | ClassSession };
	if ("data" in json.data && !Array.isArray(json.data.data)) {
		return json.data.data;
	}
	return json.data as ClassSession;
}

export async function fetchStudentClassSessions(
	page: number,
	limit: number,
): Promise<Paginated<ClassSession>> {
	const params = new URLSearchParams({ page: String(page), limit: String(limit) });
	const res = await apiFetch(`/class-sessions/student?${params}`);
	if (!res.ok) throw new Error(`Failed to fetch class sessions (${res.status})`);
	const { data } = (await res.json()) as { data: Paginated<ClassSession> };
	return data;
}

export interface AttendanceRecord {
	id: string;
	classSessionId: string;
	status: string;
	createdAt: string;
	isVerified: boolean;
	verifiedBy: string | null;
	verifiedAt: string | null;
	user: {
		username: string;
		profile: { fullName: string | null } | null;
	};
}

export async function fetchSessionAttendance(sessionId: string): Promise<AttendanceRecord[]> {
	const res = await apiFetch(`/attendances/session/${sessionId}`);
	if (!res.ok) throw new Error(`Failed to load attendance (${res.status})`);
	const { data } = (await res.json()) as { data: AttendanceRecord[] };
	return data ?? [];
}

export interface SessionWithAttendance {
	id: string;
	title: string;
	courseName: string;
	sessionDate: string;
	time: string;
	location: string;
	status: ClassSession["status"];
	attendanceId: string | null;
	attendanceStatus: ClassAttendance["status"] | null;
	isVerified: boolean;
}

export async function fetchMySessionsWithAttendance(): Promise<SessionWithAttendance[]> {
	const [sessionsRes, attendancesRes] = await Promise.all([
		apiFetch("/class-sessions?limit=100"),
		apiFetch("/attendances"),
	]);

	if (!sessionsRes.ok) throw new Error(`Failed to fetch sessions (${sessionsRes.status})`);

	const sessionsJson = await sessionsRes.json();
	const sessions: ClassSession[] = sessionsJson.data?.data ?? sessionsJson.data ?? [];

	const attendancesJson = await attendancesRes.json();
	const attendances: ClassAttendance[] = attendancesRes.ok
		? (attendancesJson.data?.data ?? attendancesJson.data ?? [])
		: [];

	const attendanceBySession = new Map<string, ClassAttendance>();
	for (const att of attendances) {
		attendanceBySession.set(att.classSessionId, att);
	}

	return sessions.map((s) => {
		const att = attendanceBySession.get(s.id) ?? null;
		return {
			id: s.id,
			title: s.title,
			courseName: s.course?.name ?? "—",
			sessionDate: new Date(s.sessionDate).toLocaleDateString("id-ID"),
			time: `${s.startTime} – ${s.endTime}`,
			location: s.meetingUrl ? s.meetingUrl : (s.location ?? "—"),
			status: s.status,
			attendanceId: att?.id ?? null,
			attendanceStatus: att?.status ?? null,
			isVerified: att?.isVerified ?? false,
		};
	});
}
