"use client";

import { useState } from "react";
import { Button, Tag, Search } from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { useQuery } from "@tanstack/react-query";
import { fetchLearningMaterials } from "@/services/learning-materials.service";
import { learningMaterialTableHeaders } from "@/constants/learning-material";
import { DATE_LOCALE } from "@/constants";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection from "@/components/ResourceTableSection";
import type { LearningMaterial } from "@/types/index.type";

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

export default function LearningMaterialPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { data, isLoading, error } = useQuery({
		queryKey: ["learning-materials", page, pageSize],
		queryFn: () => fetchLearningMaterials(page, pageSize),
	});

	const materials = data?.data ?? [];
	const total = data?.meta.total ?? 0;

	const rows = materials.map((material) => ({
		id: material.id,
		title: material.title,
		materialType: material.materialType.toUpperCase(),
		orderIndex: String(material.orderIndex),
		uploadedBy: material.uploader.profile?.fullName ?? material.uploader.username,
		createdAt: new Date(material.createdAt).toLocaleDateString(DATE_LOCALE),
	}));

	return (
		<PageLayout>
			<PageHeader
				title="Learning Materials"
				subtitle={isLoading ? "..." : `${total} materials total`}
				actions={
					<Button kind="primary" size="md" renderIcon={Add} disabled>
						Add Material
					</Button>
				}
			/>
			<ResourceTableSection
				loading={isLoading}
				error={error ? error.message : null}
				headers={learningMaterialTableHeaders}
				rows={rows}
				pagination={{
					page,
					pageSize,
					total,
					onChange: ({ page, pageSize }) => {
						setPage(page);
						setPageSize(pageSize);
					},
				}}
				toolbar={
					<Search
						closeButtonLabelText="Clear search input"
						id="search-learning-materials"
						labelText="Search"
						placeholder="Search materials (coming soon)"
						size="md"
						type="search"
						disabled
					/>
				}
				renderCell={(cell) => {
					if (cell.info.header === "materialType") {
						const type = (
							cell.value as string
						).toLowerCase() as LearningMaterial["materialType"];
						return (
							<Tag type={materialTypeTag[type]} size="sm">
								{String(cell.value)}
							</Tag>
						);
					}
					return null;
				}}
			/>
		</PageLayout>
	);
}
