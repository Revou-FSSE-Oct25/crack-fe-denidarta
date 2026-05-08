"use client";

import { useEffect, useState } from "react";
import {
	Button,
	DataTable,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Tag,
	DataTableSkeleton,
	InlineNotification,
	Pagination,
	Search,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { apiFetch } from "@/lib/api-client";
import { Course } from "@/types/index.type";
import { courseTableHeaders } from "@/constants/courses";
import { statusTagType } from "@/utils/tag-type";
import styles from "./courses.module.scss";

class HttpError extends Error {
	constructor(public status: number) {
		super(`Failed to fetch courses (${status})`);
		this.name = "HttpError";
	}
}

export default function CoursesPage() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		const controller = new AbortController();

		const params = new URLSearchParams({
			page: String(page),
			limit: String(pageSize),
		});

		async function fetchCourses() {
			try {
				const res = await apiFetch(`/courses?${params}`, {
					signal: controller.signal,
				});
				if (!res.ok) throw new HttpError(res.status);
				const { data: courseList } = (await res.json()) as {
					data: Course[];
				};
				if (!mounted) return;
				const list = courseList ?? [];
				setCourses(list);
				setTotal(list.length);
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
	}, [page, pageSize]);

	const DATE_LOCALE = "id-ID";

	const rows = courses.map((course) => ({
		id: String(course.id),
		courseName: course.name,
		instructor:
			course.instructor.profile?.fullName ?? course.instructor.username,
		status: course.status,
		startedAt: new Date(course.startedAt).toLocaleDateString(DATE_LOCALE),
		endedAt: new Date(course.endedAt).toLocaleDateString(DATE_LOCALE),
		createdAt: new Date(course.created_at).toLocaleDateString(DATE_LOCALE),
		description: course.description,
		enrolledStudents: String(course.enrollments?.length ?? 0),
	}));

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.headerContent}>
					<h1 className={styles.title}>Courses</h1>
					<p className={styles.subtitle}>
						{loading ? "..." : `${total} courses total`}
					</p>
				</div>
				<Button kind="primary" size="md" renderIcon={Add} disabled>
					Create Course
				</Button>
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
			<div className={styles.tableWrapper}>
				<div className={styles.searchBar}>
					<div className={styles.searchWrapper}>
						<Search
							closeButtonLabelText="Clear search input"
							id="search-courses"
							labelText="Search"
							placeholder="Search courses (coming soon)"
							size="md"
							type="search"
							disabled
						/>
					</div>
				</div>
				{loading ? (
					<DataTableSkeleton headers={courseTableHeaders} rowCount={10} />
				) : (
					<DataTable rows={rows} headers={courseTableHeaders} isSortable>
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

				<Pagination
					backwardText="Previous"
					forwardText="Next"
					itemsPerPageText="Items per page:"
					page={page}
					pageNumberText="Page Number"
					pageSize={pageSize}
					pageSizes={[10, 20, 30, 40, 50]}
					size="md"
					totalItems={total}
					onChange={({ page, pageSize }) => {
						setPage(page);
						setPageSize(pageSize);
					}}
				/>
			</div>
		</div>
	);
}
