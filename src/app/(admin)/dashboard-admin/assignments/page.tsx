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
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { Assignment } from "@/types/index.type";
import { assignmentTableHeaders } from "@/constants/assignments";

const ASSIGNMENT_HEADERS = [
	...assignmentTableHeaders,
	{ key: "action", header: "" },
];
import { statusTagType } from "@/utils/tag-type";
import styles from "./assignments.module.scss";

class HttpError extends Error {
	constructor(public status: number) {
		super(`Failed to fetch assignments (${status})`);
		this.name = "HttpError";
	}
}

export default function AssignmentsPage() {
	const router = useRouter();
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		const controller = new AbortController();

		async function fetchAssignments() {
			try {
				const params = new URLSearchParams({
					page: String(page),
					limit: String(pageSize),
				});
				const res = await apiFetch(`/assignments?${params}`, {
					signal: controller.signal,
				});
				if (!res.ok) throw new HttpError(res.status);
				const { data } = (await res.json()) as {
					data: { items: Assignment[]; meta: { total: number } };
				};
				if (!mounted) return;
				const list = Array.isArray(data?.items) ? data.items : [];
				setAssignments(list);
				setTotal(data?.meta?.total ?? list.length);
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
		void fetchAssignments();

		return () => {
			mounted = false;
			controller.abort();
		};
	}, [page, pageSize]);

	const DATE_LOCALE = "id-ID";

	const rows = assignments.map((assignment) => ({
		id: assignment.id,
		title: assignment.title,
		courseName: assignment.course?.name ?? "-",
		status: assignment.status,
		dueDate: new Date(assignment.dueDate).toLocaleDateString(DATE_LOCALE),
		submitted: `${assignment.submitted ?? 0} / ${assignment.toSubmit ?? 0}`,
		minPoints: assignment.minPoints,
		createdAt: new Date(assignment.createdAt).toLocaleDateString(DATE_LOCALE),
		action: assignment.id,
	}));

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.headerContent}>
					<h1 className={styles.title}>Assignments</h1>
					<p className={styles.subtitle}>
						{loading ? "..." : `${total} assignments total`}
					</p>
				</div>
				<Button kind="primary" size="md" renderIcon={Add} disabled>
					Create Assignment
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
							id="search-assignments"
							labelText="Search"
							placeholder="Search assignments (coming soon)"
							size="md"
							type="search"
							disabled
						/>
					</div>
				</div>

				{loading ? (
					<DataTableSkeleton headers={ASSIGNMENT_HEADERS} rowCount={10} />
				) : (
					<DataTable rows={rows} headers={ASSIGNMENT_HEADERS} isSortable>
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
													if (cell.info.header === "action") {
														return (
															<TableCell key={cell.id}>
																<Button
																	kind="ghost"
																	size="sm"
																	onClick={() =>
																		router.push(
																			`/dashboard-admin/assignments/${String(cell.value)}`,
																		)
																	}
																>
																	View
																</Button>
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
