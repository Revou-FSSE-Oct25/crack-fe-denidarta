"use client";

import { useEffect, useState } from "react";
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
} from "@carbon/react";
import { Launch } from "@carbon/icons-react";
import { apiFetch } from "@/lib/api-client";
import { Course, LearningMaterial } from "@/types/index.type";
import styles from "./page.module.scss";

const headers = [
	{ key: "title", header: "Title" },
	{ key: "courseName", header: "Course" },
	{ key: "materialType", header: "Type" },
	{ key: "content", header: "Description" },
	{ key: "action", header: "Open" },
];

interface MaterialRow {
	id: string;
	title: string;
	courseName: string;
	materialType: string;
	content: string;
	fileUrl: string | null;
}

export default function StudentLearningMaterialPage() {
	const [rows, setRows] = useState<MaterialRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		const controller = new AbortController();

		async function fetchAll() {
			try {
				const coursesRes = await apiFetch("/courses", {
					signal: controller.signal,
				});
				if (!coursesRes.ok)
					throw new Error(`Failed to fetch courses (${coursesRes.status})`);
				const { data: coursesData } = (await coursesRes.json()) as {
					data: { items: Course[] };
				};
				const courses: Course[] = coursesData?.items ?? [];

				const materialsByCourse = await Promise.all(
					courses.map(async (course) => {
						const res = await apiFetch(
							`/learning-materials/course/${course.id}`,
							{ signal: controller.signal },
						);
						if (!res.ok) return [];
						const { data } = (await res.json()) as { data: LearningMaterial[] };
						const items = Array.isArray(data) ? data : [];
						return items.map((m) => ({ ...m, courseName: course.name }));
					}),
				);

				if (!mounted) return;

				const flat: MaterialRow[] = materialsByCourse.flat().map((m) => ({
					id: m.id,
					title: m.title,
					courseName: m.courseName,
					materialType: m.materialType,
					content: m.content ?? "—",
					fileUrl: m.fileUrl,
				}));

				setRows(flat);
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

		void fetchAll();
		return () => {
			mounted = false;
			controller.abort();
		};
	}, []);

	if (loading) return <DataTableSkeleton headers={headers} rowCount={5} />;

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>Learning Materials</h1>
				<p className={styles.subtitle}>
					{rows.length} material{rows.length !== 1 ? "s" : ""}
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
				<p className={styles.empty}>No learning materials available yet.</p>
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
										const materialRow = rows.find((r) => r.id === row.id);
										return (
											<TableRow {...getRowProps({ row })} key={row.id}>
												{row.cells.map((cell) => {
													if (cell.info.header === "action") {
														return (
															<TableCell key={cell.id}>
																{materialRow?.fileUrl ? (
																	<Button
																		kind="ghost"
																		size="sm"
																		renderIcon={Launch}
																		iconDescription="Open"
																		href={materialRow.fileUrl}
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																		Open
																	</Button>
																) : (
																	<span className={styles.noLink}>No link</span>
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
