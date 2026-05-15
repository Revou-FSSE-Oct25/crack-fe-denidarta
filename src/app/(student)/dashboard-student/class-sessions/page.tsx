"use client";

import { useState } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMySessionsWithAttendance } from "@/services/class-sessions.service";
import { apiFetch } from "@/lib/api-client";
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

export default function StudentSessionsPage() {
	const queryClient = useQueryClient();
	const [checkInErrors, setCheckInErrors] = useState<Record<string, string>>({});
	const [checkingIn, setCheckingIn] = useState<Record<string, boolean>>({});

	const { data: rows = [], isLoading, error } = useQuery({
		queryKey: ["my-sessions"],
		queryFn: fetchMySessionsWithAttendance,
	});

	async function checkIn(sessionId: string, attendanceId: string) {
		setCheckingIn((prev) => ({ ...prev, [sessionId]: true }));
		setCheckInErrors((prev) => ({ ...prev, [sessionId]: "" }));

		try {
			const res = await apiFetch(`/attendances/${attendanceId}/check-in`, {
				method: "PATCH",
			});
			if (res.status === 403) throw new Error("Check-in not available");
			if (!res.ok) throw new Error("Check-in failed");
			void queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
		} catch (err) {
			setCheckInErrors((prev) => ({
				...prev,
				[sessionId]: err instanceof Error ? err.message : "Check-in failed",
			}));
		} finally {
			setCheckingIn((prev) => ({ ...prev, [sessionId]: false }));
		}
	}

	if (isLoading) return <DataTableSkeleton headers={headers} rowCount={5} />;

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
					subtitle={error.message}
					lowContrast
					style={{ marginBottom: "1rem" }}
				/>
			)}

			{rows.length === 0 && !error && (
				<p className={styles.empty}>No sessions available yet.</p>
			)}

			{rows.length > 0 && (
				<DataTable rows={rows} headers={headers} isSortable>
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
																	<Tag type="green" size="sm">Present</Tag>
																) : att === "unverified" ? (
																	<Tag type="gray" size="sm">Not checked in</Tag>
																) : att ? (
																	<Tag type="red" size="sm">{att}</Tag>
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
