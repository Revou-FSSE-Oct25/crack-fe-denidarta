"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Button,
	InlineNotification,
	Loading,
	Tag,
	DataTable,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	DataTableSkeleton,
} from "@carbon/react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyEnrollments } from "@/services/enrollments.service";
import { statusTagType } from "@/utils/tag-type";
import { DATE_LOCALE } from "@/constants";
import styles from "./page.module.scss";

export default function StudentProgramDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();

	const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
		queryKey: ["my-enrollments"],
		queryFn: fetchMyEnrollments,
	});

	const enrollment = useMemo(
		() => enrollments.find((e) => e.programId === id),
		[enrollments, id],
	);

	const courses = useMemo(
		() => enrollment?.program?.courses ?? [],
		[enrollment],
	);

	if (enrollmentsLoading)
		return <Loading withOverlay={false} description="Loading program..." />;

	if (!enrollment) {
		return (
			<InlineNotification
				kind="error"
				title="Not found"
				subtitle="You are not enrolled in this program."
				lowContrast
			/>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>
					{enrollment.program?.name ?? "Program"}
				</h1>
				<div className={styles.meta}>
					<span>
						Head: {enrollment.program?.headOfProgram?.fullName ?? "—"}
					</span>
					<span>·</span>
					<Tag type={statusTagType(enrollment.status)} size="sm">
						{enrollment.status}
					</Tag>
				</div>
			</div>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Courses</h2>
				{enrollmentsLoading ? (
					<DataTableSkeleton rowCount={4} headers={[]} />
				) : courses.length === 0 ? (
					<p className={styles.empty}>No courses in this program yet.</p>
				) : (
					<DataTable
						rows={courses.map((c, index) => ({
							id: c.courseId || c.id || `course-${index}`,
							name: c.courseTitle || c.name || "Untitled Course",
							instructor: c.instructor?.fullName ?? "—",
							startedAt: c.startedAt
								? new Date(c.startedAt).toLocaleDateString(DATE_LOCALE)
								: "—",
							endedAt: c.endedAt
								? new Date(c.endedAt).toLocaleDateString(DATE_LOCALE)
								: "—",
							status: c.status,
						}))}
						headers={[
							{ key: "name", header: "Course Name" },
							{ key: "instructor", header: "Instructor" },
							{ key: "startedAt", header: "Start Date" },
							{ key: "endedAt", header: "End Date" },
							{ key: "status", header: "Status" },
						]}
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
											{tableHeaders.map((h) => (
												<TableHeader
													{...getHeaderProps({ header: h })}
													key={h.key}
												>
													{h.header}
												</TableHeader>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{tableRows.map((row) => (
											<TableRow {...getRowProps({ row })} key={row.id}>
												{row.cells.map((cell) => {
													if (cell.info.header === "name") {
														return (
															<TableCell key={cell.id}>
																<Button
																	kind="ghost"
																	size="sm"
																	onClick={() =>
																		router.push(
																			`/dashboard-student/courses/${row.id}`,
																		)
																	}
																	style={{ paddingInline: 0 }}
																>
																	{String(cell.value)}
																</Button>
															</TableCell>
														);
													}
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
			</section>
		</div>
	);
}
