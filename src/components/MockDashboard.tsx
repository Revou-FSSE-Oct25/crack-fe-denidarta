import {
	Breadcrumb,
	BreadcrumbItem,
	Button,
	Column,
	DataTable,
	Grid,
	OverflowMenu,
	OverflowMenuItem,
	Search,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Tag,
	Tile,
} from "@carbon/react";
import { Add, Download, Filter } from "@carbon/icons-react";
import React from "react";

const kpis = [
	{ label: "Active users", value: "1,284", delta: "+4.1%" },
	{ label: "Conversion", value: "3.6%", delta: "+0.3%" },
	{ label: "Revenue", value: "$42.8k", delta: "+1.8%" },
	{ label: "Tickets", value: "19", delta: "-2" },
];

const headerData = [
	{ key: "id", header: "ID" },
	{ key: "title", header: "Title" },
	{ key: "status", header: "Status" },
	{ key: "owner", header: "Owner" },
	{ key: "updated", header: "Updated" },
];

const rowData = [
	{
		id: "A-1024",
		title: "Billing address update",
		status: "Open",
		owner: "S. Lee",
		updated: "2h ago",
	},
	{
		id: "A-1023",
		title: "SSO configuration",
		status: "In progress",
		owner: "M. Chen",
		updated: "6h ago",
	},
	{
		id: "A-1019",
		title: "Usage report export",
		status: "Blocked",
		owner: "A. Patel",
		updated: "1d ago",
	},
	{
		id: "A-1012",
		title: "New workspace request",
		status: "Done",
		owner: "J. Kim",
		updated: "3d ago",
	},
];

function statusTagType(status: string) {
	switch (status) {
		case "Done":
			return "green";
		case "Open":
			return "blue";
		case "In progress":
			return "teal";
		case "Blocked":
			return "red";
		default:
			return "gray";
	}
}

export default function MockDashboard() {
	return (
		<div style={{ padding: "1.5rem" }}>
			<Grid fullWidth>
				<Column sm={4} md={8} lg={16}>
					<Breadcrumb noTrailingSlash>
						<BreadcrumbItem href="#">Home</BreadcrumbItem>
						<BreadcrumbItem href="#">Operations</BreadcrumbItem>
						<BreadcrumbItem isCurrentPage>Dashboard</BreadcrumbItem>
					</Breadcrumb>
				</Column>

				<Column sm={4} md={8} lg={16} style={{ marginTop: "0.75rem" }}>
					<div
						style={{
							display: "flex",
							alignItems: "flex-start",
							justifyContent: "space-between",
							gap: "1rem",
						}}
					>
						<div>
							<h1 style={{ margin: 0, fontSize: "1.75rem", lineHeight: 1.2 }}>
								Operations dashboard
							</h1>
							<p
								style={{
									margin: "0.25rem 0 0",
									color: "var(--cds-text-secondary)",
								}}
							>
								Quick overview of activity, revenue, and support.
							</p>
						</div>
						<div
							style={{
								display: "flex",
								gap: "0.5rem",
								flexWrap: "wrap",
								justifyContent: "flex-end",
							}}
						>
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
						style={{ marginTop: "1rem" }}
					>
						<Tile>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: "0.75rem",
								}}
							>
								<div>
									<div
										style={{
											color: "var(--cds-text-secondary)",
											fontSize: "0.875rem",
										}}
									>
										{kpi.label}
									</div>
									<div
										style={{
											fontSize: "1.5rem",
											fontWeight: 600,
											marginTop: "0.25rem",
										}}
									>
										{kpi.value}
									</div>
								</div>
								<Tag
									type={kpi.delta.startsWith("-") ? "red" : "green"}
									size="sm"
								>
									{kpi.delta}
								</Tag>
							</div>
						</Tile>
					</Column>
				))}

				<Column sm={4} md={8} lg={10} style={{ marginTop: "1rem" }}>
					<Tile>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: "1rem",
							}}
						>
							<div>
								<h2 style={{ margin: 0, fontSize: "1.125rem" }}>
									Recent activity
								</h2>
								<p
									style={{
										margin: "0.25rem 0 0",
										color: "var(--cds-text-secondary)",
									}}
								>
									Latest tickets and requests.
								</p>
							</div>
							<div
								style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
							>
								<Search size="md" labelText="Search" placeholder="Search" />
								<Button
									kind="ghost"
									size="md"
									hasIconOnly
									iconDescription="Filter"
									renderIcon={Filter}
								/>
							</div>
						</div>

						<div style={{ marginTop: "1rem" }}>
							<DataTable rows={rowData} headers={headerData} isSortable>
								{({
									rows,
									headers,
									getTableProps,
									getHeaderProps,
									getRowProps,
									getTableContainerProps,
								}) => (
									<TableContainer
										title=""
										description=""
										{...getTableContainerProps()}
									>
										<Table {...getTableProps()}>
											<TableHead>
												<TableRow>
													{headers.map((header) => (
														<TableHeader {...getHeaderProps({ header })}>
															{header.header}
														</TableHeader>
													))}
													<TableHeader />
												</TableRow>
											</TableHead>
											<TableBody>
												{rows.map((row) => (
													<TableRow {...getRowProps({ row })}>
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
																<TableCell key={cell.id}>
																	{cell.value}
																</TableCell>
															);
														})}
														<TableCell>
															<OverflowMenu size="sm" ariaLabel="Row actions">
																<OverflowMenuItem itemText="View" />
																<OverflowMenuItem itemText="Assign" />
																<OverflowMenuItem itemText="Close" />
															</OverflowMenu>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								)}
							</DataTable>
						</div>
					</Tile>
				</Column>

				<Column sm={4} md={8} lg={6} style={{ marginTop: "1rem" }}>
					<Tile>
						<h2 style={{ margin: 0, fontSize: "1.125rem" }}>At a glance</h2>
						<p
							style={{
								margin: "0.25rem 0 0",
								color: "var(--cds-text-secondary)",
							}}
						>
							Placeholder panel for charts.
						</p>
						<div
							style={{
								marginTop: "1rem",
								height: 220,
								borderRadius: 6,
								border: "1px dashed var(--cds-border-subtle)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "var(--cds-text-secondary)",
							}}
						>
							Chart goes here
						</div>
					</Tile>
				</Column>
			</Grid>
		</div>
	);
}
