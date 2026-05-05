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
	DataTableSkeleton,
	InlineNotification,
	Pagination,
	Search,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { apiFetch } from "@/lib/api-client";
import { Program } from "@/types/index.type";
import { programTableHeaders } from "@/constants/programs";
import styles from "./programs.module.scss";

class HttpError extends Error {
	constructor(public status: number) {
		super(`Failed to fetch programs (${status})`);
		this.name = "HttpError";
	}
}

export default function ProgramsPage() {
	const [programs, setPrograms] = useState<Program[]>([]);
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

		async function fetchPrograms() {
			try {
				const res = await apiFetch(`/programs?${params}`, {
					signal: controller.signal,
				});
				if (!res.ok) throw new HttpError(res.status);
				const { data: programList } = (await res.json()) as {
					data: Program[];
				};
				if (!mounted) return;
				const list = programList ?? [];
				setPrograms(list);
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
		void fetchPrograms();

		return () => {
			mounted = false;
			controller.abort();
		};
	}, [page, pageSize]);

	const DATE_LOCALE = "id-ID";

	const rows = programs.map((program) => ({
		id: String(program.id),
		name: program.name,
		creator:
			program.creator.profile?.fullName ?? program.creator.username,
		courseCount: String(program.courses?.length ?? 0),
		createdAt: new Date(program.created_at).toLocaleDateString(DATE_LOCALE),
	}));

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.headerContent}>
					<h1 className={styles.title}>Programs</h1>
					<p className={styles.subtitle}>
						{loading ? "..." : `${total} programs total`}
					</p>
				</div>
				<Button kind="primary" size="md" renderIcon={Add} disabled>
					Create Program
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
							id="search-programs"
							labelText="Search"
							placeholder="Search programs (coming soon)"
							size="md"
							type="search"
							disabled
						/>
					</div>
				</div>
				{loading ? (
					<DataTableSkeleton headers={programTableHeaders} rowCount={10} />
				) : (
					<DataTable rows={rows} headers={programTableHeaders} isSortable>
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
												{row.cells.map((cell) => (
													<TableCell key={cell.id}>{cell.value}</TableCell>
												))}
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
