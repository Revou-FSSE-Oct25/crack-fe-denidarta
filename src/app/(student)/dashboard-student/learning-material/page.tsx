"use client";

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
import { useQuery } from "@tanstack/react-query";
import { fetchMyLearningMaterials } from "@/services/learning-materials.service";
import styles from "./page.module.scss";

const headers = [
	{ key: "title", header: "Title" },
	{ key: "courseName", header: "Course" },
	{ key: "materialType", header: "Type" },
	{ key: "content", header: "Description" },
	{ key: "action", header: "Open" },
];

export default function StudentLearningMaterialPage() {
	const {
		data: materials = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["my-learning-materials"],
		queryFn: fetchMyLearningMaterials,
	});

	const rows = materials.map((m) => ({
		id: m.id,
		title: m.title,
		courseName: m.courseName,
		materialType: m.materialType,
		content: m.content ?? "—",
		fileUrl: m.fileUrl,
	}));

	if (isLoading) return <DataTableSkeleton headers={headers} rowCount={5} />;

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
					subtitle={error.message}
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
