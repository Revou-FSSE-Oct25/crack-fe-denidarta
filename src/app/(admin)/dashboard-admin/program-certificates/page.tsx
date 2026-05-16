"use client";

import { useMemo, useState } from "react";
import {
	DataTable,
	DataTableSkeleton,
	Heading,
	InlineNotification,
	Search,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Tag,
} from "@carbon/react";
import { Certificate } from "@carbon/icons-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCertificates } from "@/services/certificates.service";
import { certificateTableHeaders } from "@/constants/certificates";
import styles from "./program-certificates.module.scss";
import { DATE_LOCALE } from "@/constants";

export default function ProgramCertificatesPage() {
	const [search, setSearch] = useState("");

	const {
		data: certificates = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["certificates-all"],
		queryFn: fetchAllCertificates,
	});

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return certificates;
		return certificates.filter(
			(c) =>
				c.certNumber.toLowerCase().includes(q) ||
				c.studentNameSnapshot.toLowerCase().includes(q) ||
				c.user.email.toLowerCase().includes(q) ||
				c.programNameSnapshot.toLowerCase().includes(q),
		);
	}, [certificates, search]);

	const rows = filtered.map((cert) => ({
		id: cert.id,
		certNumber: cert.certNumber,
		studentName:
			cert.studentNameSnapshot ||
			cert.user.profile?.fullName ||
			cert.user.username,
		email: cert.user.email,
		programName: cert.programNameSnapshot || cert.program.name,
		issuedAt: new Date(cert.issuedAt).toLocaleDateString(DATE_LOCALE, {
			year: "numeric",
			month: "short",
			day: "numeric",
		}),
	}));

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.headerContent}>
					<div className={styles.titleRow}>
						<Certificate size={28} />
						<Heading>Program Certificates</Heading>
					</div>
					<p className={styles.subtitle}>
						{isLoading
							? "Loading..."
							: `${filtered.length} of ${certificates.length} certificate${certificates.length !== 1 ? "s" : ""}`}
					</p>
				</div>
			</div>

			{error && (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={error.message}
					lowContrast
				/>
			)}

			<div className={styles.tableWrapper}>
				<div className={styles.searchBar}>
					<Search
						closeButtonLabelText="Clear search"
						id="search-certificates"
						labelText="Search certificates"
						placeholder="Search by certificate number, student, email or program…"
						size="md"
						type="search"
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
						onClear={() => setSearch("")}
					/>
				</div>

				{isLoading ? (
					<DataTableSkeleton headers={certificateTableHeaders} rowCount={8} />
				) : rows.length === 0 ? (
					<div className={styles.empty}>
						<Certificate size={48} className={styles.emptyIcon} />
						<p>
							{search
								? "No certificates match your search."
								: "No certificates have been issued yet."}
						</p>
					</div>
				) : (
					<DataTable rows={rows} headers={certificateTableHeaders} isSortable>
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
													if (cell.info.header === "certNumber") {
														return (
															<TableCell key={cell.id}>
																<Tag type="teal" size="sm">
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
		</div>
	);
}
