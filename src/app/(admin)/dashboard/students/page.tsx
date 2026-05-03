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
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { apiFetch } from "@/lib/helper";
import { User } from "@/types/index.type";
import { studentTableHeaders } from "@/constants/students";

function statusTagType(status: string) {
	switch (status) {
		case "active":
			return "green";
		case "invited":
			return "blue";
		case "inactive":
			return "gray";
		default:
			return "gray";
	}
}

export default function StudentsPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		apiFetch("/users?role=student")
			.then((res) => {
				if (!res.ok)
					throw new Error(`Failed to fetch students (${res.status})`);
				return res.json() as Promise<{ data: User[] }>;
			})
			.then(({ data }) => setUsers(data))
			.catch((err: Error) => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	const rows = users.map((u) => ({
		id: String(u.id),
		username: u.username,
		email: u.email,
		status: u.status,
		createdAt: new Date(u.createdAt).toLocaleDateString("id-ID"),
	}));

	return (
		<div style={{ padding: "1.5rem" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					marginBottom: "1.5rem",
				}}
			>
				<div>
					<h1 style={{ margin: 0, fontSize: "1.75rem" }}>Students</h1>
					<p
						style={{
							margin: "0.25rem 0 0",
							color: "var(--cds-text-secondary)",
						}}
					>
						{loading ? "..." : `${users.length} students total`}
					</p>
				</div>
				<Button kind="primary" size="md" renderIcon={Add}>
					Add Student
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

			{loading ? (
				<DataTableSkeleton headers={studentTableHeaders} rowCount={10} />
			) : (
				<DataTable rows={rows} headers={studentTableHeaders} isSortable>
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
