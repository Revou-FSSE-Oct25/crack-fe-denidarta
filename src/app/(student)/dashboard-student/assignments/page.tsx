"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { apiFetch } from "@/lib/api-client";
import { Assignment } from "@/types/index.type";
import { statusTagType } from "@/utils/tag-type";
import styles from "./page.module.scss";

const headers = [
	{ key: "title", header: "Assignment" },
	{ key: "courseName", header: "Course" },
	{ key: "dueDate", header: "Due Date" },
	{ key: "assignmentStatus", header: "Status" },
	{ key: "submissionStatus", header: "My Submission" },
];

interface AssignmentRow {
	id: string;
	title: string;
	courseName: string;
	dueDate: string;
	assignmentStatus: string;
	submissionStatus: string;
}

function deriveSubmissionStatus(a: Assignment): string {
	const sub = a.submissions?.[0];
	if (!sub) return "Not Submitted";
	if (sub.status === "graded")
		return sub.passed ? "Graded — Passed" : "Graded — Failed";
	return sub.status === "submitted" ? "Submitted" : "Draft";
}

export default function StudentAssignmentsPage() {
	const router = useRouter();
	const [rows, setRows] = useState<AssignmentRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		const controller = new AbortController();

		async function fetchAssignments() {
			try {
				const res = await apiFetch("/assignments?limit=100", {
					signal: controller.signal,
				});
				if (!res.ok)
					throw new Error(`Failed to fetch assignments (${res.status})`);
				const { data } = (await res.json()) as {
					data: { items: Assignment[] };
				};
				if (!mounted) return;
				const assignments: Assignment[] = data?.items ?? [];
				setRows(
					assignments.map((a) => ({
						id: a.id,
						title: a.title,
						courseName: a.course?.name ?? "—",
						dueDate: new Date(a.dueDate).toLocaleDateString("id-ID"),
						assignmentStatus: a.status,
						submissionStatus: deriveSubmissionStatus(a),
					})),
				);
			} catch (err) {
				if (
					!mounted ||
					(err instanceof DOMException && err.name === "AbortError")
				)
					return;
				setError(
					err instanceof Error ? err.message : "An unexpected error occurred",
				);
			} finally {
				if (mounted) setLoading(false);
			}
		}

		void fetchAssignments();
		return () => {
			mounted = false;
			controller.abort();
		};
	}, []);

	if (loading) return <DataTableSkeleton headers={headers} rowCount={5} />;

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>My Assignments</h1>
				<p className={styles.subtitle}>
					{rows.length} assignment{rows.length !== 1 ? "s" : ""}
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
				<p className={styles.empty}>No assignments available yet.</p>
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
									{tableRows.map((row) => (
										<TableRow
											{...getRowProps({ row })}
											key={row.id}
											onClick={() =>
												router.push(`/dashboard-student/assignments/${row.id}`)
											}
											style={{ cursor: "pointer" }}
										>
											{row.cells.map((cell) => {
												if (
													cell.info.header === "assignmentStatus" ||
													cell.info.header === "submissionStatus"
												) {
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
													<TableCell key={cell.id}>{cell.value}</TableCell>
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
