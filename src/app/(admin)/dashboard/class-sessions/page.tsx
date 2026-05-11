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
	Heading,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { apiFetch } from "@/lib/api-client";
import { ClassSession } from "@/types/index.type";
import { classSessionTableHeaders } from "@/constants/class-sessions";
import { statusTagType } from "@/utils/tag-type";
import styles from "./class-sessions.module.scss";

class HttpError extends Error {
	constructor(public status: number) {
		super(`Failed to fetch class sessions (${status})`);
		this.name = "HttpError";
	}
}

function formatTime(isoString: string): string {
	// Times from BE are stored as "1970-01-01THH:mm:ss.000Z".
	// Parse in UTC to get the raw HH:mm value, then label as WIB.
	return (
		new Date(isoString).toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "UTC",
		}) + " WIB"
	);
}

export default function ClassSessionsPage() {
	const [sessions, setSessions] = useState<ClassSession[]>([]);
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

		async function fetchSessions() {
			try {
				const res = await apiFetch(`/class-sessions?${params}`, {
					signal: controller.signal,
				});
				if (!res.ok) throw new HttpError(res.status);
				const { data } = (await res.json()) as { data: ClassSession[] };
				if (!mounted) return;
				const list = data ?? [];
				setSessions(list);
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
		void fetchSessions();

		return () => {
			mounted = false;
			controller.abort();
		};
	}, [page, pageSize]);

	const rows = sessions.map((session) => ({
		id: String(session.id),
		sessionInfo: {
			primary: session.title,
			secondary: session.course?.name ?? "—",
		},
		sessionDate: new Date(session.sessionDate).toLocaleDateString("id-ID"),
		timeInfo: {
			primary: formatTime(session.startTime),
			secondary: formatTime(session.endTime),
		},
		status: session.status,
	}));

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.headerContent}>
					<Heading>Class Sessions</Heading>
					<p className={styles.subtitle}>
						{loading ? "..." : `${total} class sessions total`}
					</p>
				</div>
				<Button kind="primary" size="md" renderIcon={Add} disabled>
					Create Session
				</Button>
			</div>

			{error !== null && (
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
							id="search-sessions"
							labelText="Search"
							placeholder="Search sessions (coming soon)"
							size="md"
							type="search"
							disabled
						/>
					</div>
				</div>

				{loading ? (
					<DataTableSkeleton headers={classSessionTableHeaders} rowCount={10} />
				) : (
					<DataTable rows={rows} headers={classSessionTableHeaders} isSortable>
						{({
							rows,
							headers,
							getTableProps,
							getHeaderProps,
							getRowProps,
							getTableContainerProps,
						}) => (
							<TableContainer {...getTableContainerProps()}>
								<Table {...getTableProps()} size="xl">
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
													// Two-line cell: sessionInfo (Session Title + Course Title)
													if (cell.info.header === "sessionInfo") {
														const v = cell.value as {
															primary: string;
															secondary: string;
														};
														return (
															<TableCell key={cell.id}>
																<p
																	style={{
																		fontWeight: 400,
																		marginBottom: "0.125rem",
																	}}
																>
																	{v.primary}
																</p>
																<p
																	style={{
																		fontSize: "0.75rem",
																		color: "#525252",
																		margin: 0,
																	}}
																>
																	{v.secondary}
																</p>
															</TableCell>
														);
													}

													// Two-line cell: timeInfo (Start Time + End Time)
													if (cell.info.header === "timeInfo") {
														const v = cell.value as {
															primary: string;
															secondary: string;
														};
														return (
															<TableCell key={cell.id}>
																<p
																	style={{
																		fontWeight: 400,
																		marginBottom: "0.125rem",
																	}}
																>
																	{v.primary}
																</p>
																<p
																	style={{
																		fontSize: "0.75rem",
																		color: "#525252",
																		margin: 0,
																	}}
																>
																	{v.secondary}
																</p>
															</TableCell>
														);
													}

													// Status cell — Tag rendering
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

													// Default cell
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
