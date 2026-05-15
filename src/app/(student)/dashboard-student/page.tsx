"use client";

import { useEffect, useState } from "react";
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
import { Course } from "@/types/index.type";
import { statusTagType } from "@/utils/tag-type";
import styles from "./page.module.scss";

const headers = [
	{ key: "courseName", header: "Course Name" },
	{ key: "instructor", header: "Instructor" },
	{ key: "status", header: "Status" },
	{ key: "description", header: "Description" },
];

class HttpError extends Error {
	constructor(public status: number) {
		super(`Failed to fetch courses (${status})`);
		this.name = "HttpError";
	}
}

export default function StudentDashboardPage() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		const controller = new AbortController();

		async function fetchCourses() {
			try {
				const res = await apiFetch("/courses", { signal: controller.signal });
				if (!res.ok) throw new HttpError(res.status);
				const { data } = (await res.json()) as {
					data: { items: Course[]; meta: { total: number } };
				};
				if (!mounted) return;
				setCourses(data?.items ?? []);
			} catch (err) {
				if (
					!mounted ||
					(err instanceof DOMException && err.name === "AbortError")
				)
					return;
				if (err instanceof HttpError) {
					setError(err.message);
				} else if (err instanceof SyntaxError) {
					setError("Invalid response format from server");
				} else if (err instanceof Error) {
					setError(err.message);
				} else {
					setError("An unexpected error occurred");
				}
			} finally {
				if (mounted) setLoading(false);
			}
		}

		void fetchCourses();

		return () => {
			mounted = false;
			controller.abort();
		};
	}, []);

	const rows = courses.map((course) => ({
		id: String(course.id),
		courseName: course.name,
		instructor: course.instructor.profile?.fullName ?? "-",
		status: course.status,
		description: course.description,
	}));

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>My Courses</h1>
				<p className={styles.subtitle}>
					{loading
						? "..."
						: `${courses.length} course${courses.length !== 1 ? "s" : ""} enrolled`}
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

			{loading ? (
				<DataTableSkeleton headers={headers} rowCount={5} />
			) : (
				<DataTable rows={rows} headers={headers} isSortable>
					{({
						rows,
						headers,
						getTableProps,
						getHeaderProps,
						getRowProps,
						getTableContainerProps,
					}) => (
						<TableContainer {...getTableContainerProps()}>
							<Table {...getTableProps()}>
								<TableHead>
									<TableRow>
										{headers.map((header) => (
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
									{rows.map((row) => (
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
