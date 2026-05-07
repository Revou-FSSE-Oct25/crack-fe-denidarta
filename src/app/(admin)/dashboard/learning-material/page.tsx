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
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { apiFetch } from "@/lib/api-client";
import { LearningMaterial } from "@/types/index.type";
import { learningMaterialTableHeaders } from "@/constants/learning-material";
import styles from "./learning-material.module.scss";

type TagType =
	| "purple"
	| "red"
	| "teal"
	| "blue"
	| "gray"
	| "green"
	| "magenta"
	| "cyan"
	| "warm-gray"
	| "cool-gray"
	| "high-contrast"
	| "outline";

const materialTypeTag: Record<LearningMaterial["materialType"], TagType> = {
	video: "purple",
	pdf: "red",
	article: "teal",
	slides: "blue",
	other: "gray",
};

const DATE_LOCALE = "id-ID";

export default function LearningMaterialPage() {
	const [materials, setMaterials] = useState<LearningMaterial[]>([]);
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

		(async () => {
			try {
				const res = await apiFetch(`/learning-materials?${params.toString()}`, {
					signal: controller.signal,
				});
				if (!res.ok) throw new Error(`Failed to fetch learning materials (${res.status})`);
				const { data } = (await res.json()) as {
					data: { data: LearningMaterial[]; total: number };
				};
				if (!mounted) return;
				setMaterials(data.data);
				setTotal(data.total);
			} catch (err) {
				if (!mounted || (err as Error).name === "AbortError") return;
				setError((err as Error).message);
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
			controller.abort();
		};
	}, [page, pageSize]);

	const rows = materials.map((MATERIAL) => ({
		id: MATERIAL.id,
		title: MATERIAL.title,
		materialType: MATERIAL.materialType.toUpperCase(),
		orderIndex: String(MATERIAL.orderIndex),
		uploadedBy: MATERIAL.uploader.profile?.fullName ?? MATERIAL.uploader.username,
		createdAt: new Date(MATERIAL.createdAt).toLocaleDateString(DATE_LOCALE),
	}));

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.headerContent}>
					<h1 className={styles.title}>Learning Materials</h1>
					<p className={styles.subtitle}>
						{loading ? "..." : `${total} materials total`}
					</p>
				</div>
				<Button kind="primary" size="md" renderIcon={Add} disabled>
					Add Material
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
							id="search-learning-materials"
							labelText="Search"
							placeholder="Search materials (coming soon)"
							size="md"
							type="search"
							disabled
						/>
					</div>
				</div>

				{loading ? (
					<DataTableSkeleton
						headers={learningMaterialTableHeaders}
						rowCount={10}
					/>
				) : (
					<DataTable rows={rows} headers={learningMaterialTableHeaders} isSortable>
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
													if (cell.info.header === "materialType") {
														const type =
															(cell.value as string).toLowerCase() as LearningMaterial["materialType"];
														return (
															<TableCell key={cell.id}>
																<Tag type={materialTypeTag[type]} size="sm">
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
