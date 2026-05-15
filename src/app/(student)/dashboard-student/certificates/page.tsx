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
} from "@carbon/react";
import { apiFetch } from "@/lib/api-client";
import { Certificate } from "@/types/index.type";
import styles from "./page.module.scss";

const headers = [
	{ key: "programNameSnapshot", header: "Program" },
	{ key: "studentNameSnapshot", header: "Student Name" },
	{ key: "issuedAt", header: "Issued Date" },
	{ key: "certNumber", header: "Certificate No." },
];

interface CertificateRow {
	id: string;
	programNameSnapshot: string;
	studentNameSnapshot: string;
	issuedAt: string;
	certNumber: string;
}

export default function StudentCertificatesPage() {
	const [rows, setRows] = useState<CertificateRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		const controller = new AbortController();

		async function fetchCertificates() {
			try {
				const res = await apiFetch("/certificates/my", {
					signal: controller.signal,
				});
				if (!res.ok)
					throw new Error(`Failed to fetch certificates (${res.status})`);
				const { data } = (await res.json()) as { data: Certificate[] };
				if (!mounted) return;
				const certs = Array.isArray(data) ? data : [];
				setRows(
					certs.map((c) => ({
						id: c.id,
						programNameSnapshot:
							c.programNameSnapshot ?? c.program?.name ?? "—",
						studentNameSnapshot:
							c.studentNameSnapshot ?? c.user?.profile?.fullName ?? "—",
						issuedAt: new Date(c.issuedAt).toLocaleDateString("id-ID"),
						certNumber: c.certNumber ?? "—",
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

		void fetchCertificates();
		return () => {
			mounted = false;
			controller.abort();
		};
	}, []);

	if (loading) return <DataTableSkeleton headers={headers} rowCount={3} />;

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>My Certificates</h1>
				<p className={styles.subtitle}>
					{rows.length} certificate{rows.length !== 1 ? "s" : ""}
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
				<p className={styles.empty}>
					No certificates yet. Complete all assignments in a program to become
					eligible.
				</p>
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
		</div>
	);
}
