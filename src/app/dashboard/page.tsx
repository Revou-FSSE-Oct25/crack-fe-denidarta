"use client";
import {
	Breadcrumb,
	BreadcrumbItem,
	Button,
	Column,
	DataTable,
	Grid,
	OverflowMenu,
	OverflowMenuItem,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Tag,
	Tile,
	DataTableSkeleton,
} from "@carbon/react";
import { Add, Download } from "@carbon/icons-react";
import React, { useEffect, useState } from "react";
import styles from "./page.module.scss";
import { apiFetch } from "@/lib/helper";

interface User {
	id: number;
	username: string;
	email: string;
	role: string;
	status: string;
	createdAt: string;
}

const activityHeaders = [
	{ key: "username", header: "Username" },
	{ key: "email", header: "Email" },
	{ key: "role", header: "Role" },
	{ key: "status", header: "Status" },
	{ key: "createdAt", header: "Joined" },
];

function statusTagType(status: string) {
	switch (status) {
		case "ACTIVE":
			return "green";
		case "INVITED":
			return "blue";
		case "INACTIVE":
			return "gray";
		default:
			return "gray";
	}
}

function roleTagType(role: string) {
	switch (role) {
		case "ADMIN":
			return "purple";
		case "INSTRUCTOR":
			return "teal";
		case "STUDENT":
			return "blue";
		default:
			return "gray";
	}
}

export default function DashboardPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		apiFetch("/users")
			.then((res) => (res.ok ? res.json() : []))
			.then((data: User[]) => setUsers(data))
			.catch(() => setUsers([]))
			.finally(() => setLoading(false));
	}, []);

	const students = users.filter((u) => u.role === "STUDENT");
	const instructors = users.filter((u) => u.role === "INSTRUCTOR");
	const activeUsers = users.filter((u) => u.status === "ACTIVE");

	const kpis = [
		{ label: "Total Users", value: loading ? "—" : String(users.length) },
		{ label: "Students", value: loading ? "—" : String(students.length) },
		{ label: "Instructors", value: loading ? "—" : String(instructors.length) },
		{ label: "Active", value: loading ? "—" : String(activeUsers.length) },
	];

	const recentUsers = [...users]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.slice(0, 10);

	const rows = recentUsers.map((u) => ({
		id: String(u.id),
		username: u.username,
		email: u.email,
		role: u.role,
		status: u.status,
		createdAt: new Date(u.createdAt).toLocaleDateString("id-ID"),
	}));

	return (
		<div className={styles.wrapper}>
			<Grid fullWidth>
				<Column sm={4} md={8} lg={16}>
					<Breadcrumb noTrailingSlash>
						<BreadcrumbItem href="#">Home</BreadcrumbItem>
						<BreadcrumbItem isCurrentPage>Dashboard</BreadcrumbItem>
					</Breadcrumb>
				</Column>

				<Column sm={4} md={8} lg={16}>
					<div className={styles.pageHeader}>
						<div>
							<h1>Dashboard</h1>
							<p>Overview of users and activity.</p>
						</div>
						<div className={styles.pageActions}>
							<Button kind="secondary" size="md" renderIcon={Download}>
								Export
							</Button>
							<Button kind="primary" size="md" renderIcon={Add}>
								New item
							</Button>
						</div>
					</div>
				</Column>

				{kpis.map((kpi) => (
					<Column
						key={kpi.label}
						sm={4}
						md={4}
						lg={4}
						className={styles.kpiColumn}
					>
						<Tile>
							<div className={styles.kpiTile}>
								<div>
									<div className={styles.kpiLabel}>{kpi.label}</div>
									<div className={styles.kpiValue}>{kpi.value}</div>
								</div>
							</div>
						</Tile>
					</Column>
				))}

				<Column sm={4} md={8} lg={16} className={styles.activityColumn}>
					<Tile>
						<div className={styles.activityHeader}>
							<div>
								<h2>Recent users</h2>
								<p>Last 10 registered users.</p>
							</div>
						</div>

						<div className={styles.tableWrapper}>
							{loading ? (
								<DataTableSkeleton headers={activityHeaders} rowCount={5} />
							) : (
								<DataTable rows={rows} headers={activityHeaders} isSortable>
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
														<TableHeader />
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
																if (cell.info.header === "role") {
																	return (
																		<TableCell key={cell.id}>
																			<Tag
																				type={roleTagType(String(cell.value))}
																				size="sm"
																			>
																				{String(cell.value)}
																			</Tag>
																		</TableCell>
																	);
																}
																return (
																	<TableCell key={cell.id}>
																		{cell.value}
																	</TableCell>
																);
															})}
															<TableCell>
																<OverflowMenu
																	size="sm"
																	aria-label="Row actions"
																>
																	<OverflowMenuItem itemText="View" />
																	<OverflowMenuItem itemText="Edit" />
																</OverflowMenu>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</TableContainer>
									)}
								</DataTable>
							)}
						</div>
					</Tile>
				</Column>
			</Grid>
		</div>
	);
}
