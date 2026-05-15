import {
	DataTable,
	DataTableSkeleton,
	InlineNotification,
	Pagination,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "@carbon/react";
import styles from "./ResourceTableSection.module.scss";

interface Cell {
	id: string;
	value: unknown;
	info: { header: string };
}

interface Row {
	id: string;
	cells: Cell[];
}

interface PaginationConfig {
	page: number;
	pageSize: number;
	total: number;
	onChange: (args: { page: number; pageSize: number }) => void;
}

interface ResourceTableSectionProps {
	loading: boolean;
	error: string | null;
	headers: readonly { key: string; header: string }[];
	rows: readonly ({ id: string } & Record<string, unknown>)[];
	pagination?: PaginationConfig;
	toolbar?: React.ReactNode;
	renderCell?: (cell: Cell, row: Row) => React.ReactNode | null;
}

export { styles as resourceTableStyles };

export default function ResourceTableSection({
	loading,
	error,
	headers,
	rows,
	pagination,
	toolbar,
	renderCell,
}: ResourceTableSectionProps) {
	return (
		<div>
			{error && (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={error}
					lowContrast
					className={styles.notification}
				/>
			)}

			{toolbar && <div className={styles.toolbar}>{toolbar}</div>}

			{loading ? (
				<DataTableSkeleton headers={[...headers]} rowCount={10} />
			) : (
				<DataTable rows={[...rows]} headers={[...headers]} isSortable>
					{({
						rows: tableRows,
						headers: tableHeaders,
						getTableProps,
						getHeaderProps,
						getRowProps,
						getTableContainerProps,
					}) => (
						<TableContainer {...getTableContainerProps()}>
							<Table {...getTableProps()} size="xl">
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
											{row.cells.map((cell) => {
												const custom = renderCell?.(cell, row);
												if (custom !== null && custom !== undefined) {
													return <TableCell key={cell.id}>{custom}</TableCell>;
												}
												return (
													<TableCell key={cell.id}>
														{cell.value as React.ReactNode}
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

			{pagination && (
				<Pagination
					backwardText="Previous"
					forwardText="Next"
					itemsPerPageText="Items per page:"
					page={pagination.page}
					pageNumberText="Page Number"
					pageSize={pagination.pageSize}
					pageSizes={[10, 20, 30, 40, 50]}
					size="lg"
					totalItems={pagination.total}
					onChange={pagination.onChange}
				/>
			)}
		</div>
	);
}
