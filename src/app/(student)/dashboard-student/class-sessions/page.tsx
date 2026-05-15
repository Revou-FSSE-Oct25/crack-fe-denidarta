"use client";

import { useCallback, useEffect, useState } from "react";
import {
	Button,
	DataTable,
	DataTableSkeleton,
	InlineNotification,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Tag,
} from "@carbon/react";
import { apiFetch } from "@/lib/api-client";
import { ClassAttendance, ClassSession } from "@/types/index.type";
import { statusTagType } from "@/utils/tag-type";
import styles from "./page.module.scss";

const headers = [
	{ key: "title", header: "Session" },
	{ key: "courseName", header: "Course" },
	{ key: "sessionDate", header: "Date" },
	{ key: "time", header: "Time" },
	{ key: "location", header: "Location" },
	{ key: "status", header: "Status" },
	{ key: "attendance", header: "Attendance" },
	{ key: "action", header: "Action" },
];

interface SessionRow {
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

export default function StudentSessionsPage() {
	const [rows, setRows] = useState<SessionRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [checkInErrors, setCheckInErrors] = useState<Record<string, string>>(
		{},
	);
	const [checkingIn, setCheckingIn] = useState<Record<string, boolean>>({});

	const fetchAll = useCallback(async () => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);

		try {
			const [sessionsRes, attendancesRes] = await Promise.all([
				apiFetch("/class-sessions?limit=100", { signal: controller.signal }),
				apiFetch("/attendances", { signal: controller.signal }),
			]);

			if (!sessionsRes.ok)
				throw new Error(`Failed to fetch sessions (${sessionsRes.status})`);

			const { data: sessionsData } = (await sessionsRes.json()) as {
				data: { items: ClassSession[] };
			};
			const sessions: ClassSession[] = sessionsData?.items ?? [];

			const attendances: ClassAttendance[] = attendancesRes.ok
				? (((await attendancesRes.json()) as { data: ClassAttendance[] })
						.data ?? [])
				: [];

			const attendanceBySession = new Map<string, ClassAttendance>();
			for (const att of attendances) {
				attendanceBySession.set(att.classSessionId, att);
			}

			const mapped: SessionRow[] = sessions.map((s) => {
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

			setRows(mapped);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchAll();
	}, [fetchAll]);

	async function checkIn(sessionId: string, attendanceId: string) {
		setCheckingIn((prev) => ({ ...prev, [sessionId]: true }));
		setCheckInErrors((prev) => ({ ...prev, [sessionId]: "" }));

		try {
			const res = await apiFetch(`/attendances/${attendanceId}/check-in`, {
				method: "PATCH",
			});
			if (res.status === 403) throw new Error("Check-in not available");
			if (!res.ok) throw new Error("Check-in failed");

			setRows((prev) =>
				prev.map((r) =>
					r.id === sessionId ? { ...r, attendanceStatus: "present" } : r,
				),
			);
		} catch (err) {
			setCheckInErrors((prev) => ({
				...prev,
				[sessionId]: err instanceof Error ? err.message : "Check-in failed",
			}));
		} finally {
			setCheckingIn((prev) => ({ ...prev, [sessionId]: false }));
		}
	}

	if (loading) return <DataTableSkeleton headers={headers} rowCount={5} />;

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>Class Sessions</h1>
				<p className={styles.subtitle}>
					{rows.length} session{rows.length !== 1 ? "s" : ""}
				</p>
			</div>

			{error && (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={error}
					lowContrast
					style={{ marginBottom: "1rem" }}
				/>
			)}

			{rows.length === 0 && !error && (
				<p className={styles.empty}>No sessions available yet.</p>
			)}

			{rows.length > 0 && (
				<DataTable
					rows={rows.map((r) => ({ ...r, id: r.id }))}
					headers={headers}
					isSortable
				>
					{({
						rows: tableRows,
						headers: tableHeaders,
						getTableProps,
						getHeaderProps,
						getRowProps,
						getTableContainerProps,
					}) => (
						<TableContainer {...getTableContainerProps()}>
							<Table {...getTableProps()}>
								<TableHead>
									<TableRow>
										{tableHeaders.map((header) => (
											<TableHeader
												{...getHeaderProps({ header })}
												key={header.key}
											>
												{header.header}
											</TableHeader>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{tableRows.map((row) => {
										const sessionRow = rows.find((r) => r.id === row.id)!;
										return (
											<TableRow {...getRowProps({ row })} key={row.id}>
												{row.cells.map((cell) => {
													if (cell.info.header === "status") {
														return (
															<TableCell key={cell.id}>
																<Tag
																	type={statusTagType(String(cell.value))}
																	size="sm"
																>
																	{String(cell.value)}
																</Tag>
															</TableCell>
														);
													}

													if (cell.info.header === "attendance") {
														const att = sessionRow.attendanceStatus;
														return (
															<TableCell key={cell.id}>
																{att === "present" ? (
																	<Tag type="green" size="sm">
																		Present
																	</Tag>
																) : att === "unverified" ? (
																	<Tag type="gray" size="sm">
																		Not checked in
																	</Tag>
																) : att ? (
																	<Tag type="red" size="sm">
																		{att}
																	</Tag>
																) : (
																	<span>—</span>
																)}
															</TableCell>
														);
													}

													if (cell.info.header === "action") {
														const canCheckIn =
															sessionRow.status === "ongoing" &&
															sessionRow.attendanceStatus === "unverified" &&
															sessionRow.attendanceId !== null;

														return (
															<TableCell key={cell.id}>
																{canCheckIn && (
																	<div>
																		<Button
																			kind="primary"
																			size="sm"
																			onClick={() =>
																				checkIn(
																					sessionRow.id,
																					sessionRow.attendanceId!,
																				)
																			}
																			disabled={checkingIn[sessionRow.id]}
																		>
																			{checkingIn[sessionRow.id]
																				? "Checking in..."
																				: "Check In"}
																		</Button>
																		{checkInErrors[sessionRow.id] && (
																			<p className={styles.rowError}>
																				{checkInErrors[sessionRow.id]}
																			</p>
																		)}
																	</div>
																)}
															</TableCell>
														);
													}

													if (cell.info.header === "location") {
														const isUrl = String(cell.value).startsWith("http");
														return (
															<TableCell key={cell.id}>
																{isUrl ? (
																	<a
																		href={String(cell.value)}
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																		Join
																	</a>
																) : (
																	cell.value
																)}
															</TableCell>
														);
													}

													return (
														<TableCell key={cell.id}>{cell.value}</TableCell>
													);
												})}
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</DataTable>
			)}
		</div>
	);
}
