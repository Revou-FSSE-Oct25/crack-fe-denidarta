"use client";

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
import { useQuery } from "@tanstack/react-query";
import { fetchMyCertificates } from "@/services/certificates.service";
import styles from "./page.module.scss";

const headers = [
	{ key: "programNameSnapshot", header: "Program" },
	{ key: "studentNameSnapshot", header: "Student Name" },
	{ key: "issuedAt", header: "Issued Date" },
	{ key: "certNumber", header: "Certificate No." },
];

export default function StudentCertificatesPage() {
	const {
		data: certs = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["my-certificates"],
		queryFn: fetchMyCertificates,
	});

	const rows = certs.map((c) => ({
		id: c.id,
		programNameSnapshot: c.programNameSnapshot ?? c.program?.name ?? "—",
		studentNameSnapshot:
			c.studentNameSnapshot ?? c.user?.profile?.fullName ?? "—",
		issuedAt: new Date(c.issuedAt).toLocaleDateString("id-ID"),
		certNumber: c.certNumber ?? "—",
	}));

	if (isLoading) return <DataTableSkeleton headers={headers} rowCount={3} />;

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
					subtitle={error.message}
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
