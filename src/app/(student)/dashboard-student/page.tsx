"use client";

import { useMemo } from "react";
import {
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
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { fetchAllCourses } from "@/services/courses.service";
import { fetchMyAssignments } from "@/services/assignments.service";
import { fetchMySessionsWithAttendance } from "@/services/class-sessions.service";
import StatTile from "@/components/StatTile";
import { statusTagType } from "@/utils/tag-type";
import type { Course } from "@/types/index.type";
import styles from "./page.module.scss";

const headers = [
	{ key: "courseName", header: "Course Name" },
	{ key: "instructor", header: "Instructor" },
	{ key: "status", header: "Status" },
	{ key: "description", header: "Description" },
];

export default function StudentDashboardPage() {
	const {
		data: courses = [],
		isLoading: coursesLoading,
		error: coursesError,
	} = useQuery({
		queryKey: ["student-courses-all"],
		queryFn: fetchAllCourses,
	});

	const { data: assignments = [] } = useQuery({
		queryKey: ["my-assignments"],
		queryFn: fetchMyAssignments,
	});

	const { data: sessions = [] } = useQuery({
		queryKey: ["my-sessions"],
		queryFn: fetchMySessionsWithAttendance,
	});

	const stats = useMemo(() => {
		const submitted = assignments.filter(
			(a) =>
				a.submissions?.[0]?.status === "submitted" ||
				a.submissions?.[0]?.status === "graded",
		).length;
		const total = assignments.length;

		const passed = assignments.filter(
			(a) => a.submissions?.[0]?.passed === true,
		).length;

		const attended = sessions.filter(
			(s) => s.attendanceStatus === "present",
		).length;
		const totalSessions = sessions.filter(
			(s) => s.status !== "cancelled",
		).length;
		const attendanceRate =
			totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : null;

		return { submitted, total, passed, attendanceRate, totalSessions };
	}, [assignments, sessions]);

	const rows = courses.map((course: Course) => ({
		id: String(course.id),
		courseName: course.name,
		instructor: course.instructor?.profile?.fullName ?? "-",
		status: course.status,
		description: course.description,
	}));

	return (
		<div className={styles.container}>
			{/* Progress strip */}
			<div
				style={{
					display: "flex",
					gap: "1rem",
					flexWrap: "wrap",
					marginBottom: "2rem",
				}}
			>
				<StatTile
					label="Assignments"
					value={`${stats.submitted} / ${stats.total}`}
					subtitle="submitted"
				/>
				<StatTile
					label="Graded & Passed"
					value={stats.passed}
					subtitle="assignments"
				/>
				<StatTile
					label="Attendance"
					value={
						stats.attendanceRate !== null ? `${stats.attendanceRate}%` : "—"
					}
					subtitle={
						stats.totalSessions > 0
							? `${stats.totalSessions} sessions`
							: "no sessions yet"
					}
				/>
			</div>

			<div className={styles.header}>
				<h1 className={styles.title}>My Courses</h1>
				<p className={styles.subtitle}>
					{coursesLoading
						? "..."
						: `${courses.length} course${courses.length !== 1 ? "s" : ""} enrolled`}
				</p>
			</div>

			{coursesError && (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={
						coursesError instanceof Error
							? coursesError.message
							: "Failed to load courses"
					}
					lowContrast
					style={{ marginBottom: "1rem" }}
				/>
			)}

			{coursesLoading ? (
				<DataTableSkeleton headers={headers} rowCount={5} />
			) : (
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
									{tableRows.map((row) => (
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
												return (
													<TableCell key={cell.id}>
														{cell.value as string}
													</TableCell>
												);
											})}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</DataTable>
			)}
		</div>
	);
}
