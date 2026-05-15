"use client";

import { useState } from "react";
import { Button, Tag, ExpandableSearch } from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCourses } from "@/services/courses.service";
import { courseTableHeaders } from "@/constants/courses";
import { statusTagType } from "@/utils/tag-type";
import { DATE_LOCALE } from "@/constants";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection, {
	resourceTableStyles,
} from "@/components/ResourceTableSection";
import CreateCourseModal from "@/components/Modals/CreateCourseModal";

export default function CoursesPage() {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const { data, isLoading, error } = useQuery({
		queryKey: ["courses", page, pageSize],
		queryFn: () => fetchCourses(page, pageSize),
	});

	const courses = data?.data ?? [];
	const total = data?.meta.total ?? 0;

	const rows = courses.map((course) => ({
		id: String(course.id),
		courseName: {
			primary: course.name,
			secondary: course.program?.name ?? "—",
		},
		instructor: course.instructor.profile?.fullName ?? "—",
		status: course.status,
		createdAt: new Date(course.createdAt).toLocaleString(DATE_LOCALE),
		startedAt: course.startedAt
			? new Date(course.startedAt).toLocaleDateString(DATE_LOCALE)
			: "—",
		endedAt: course.endedAt
			? new Date(course.endedAt).toLocaleDateString(DATE_LOCALE)
			: "—",
		description: course.description ?? "—",
	}));

	return (
		<PageLayout>
			<PageHeader
				title="Courses"
				subtitle={isLoading ? "..." : `${total} courses total`}
			/>
			<ResourceTableSection
				loading={isLoading}
				error={error ? error.message : null}
				headers={courseTableHeaders}
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
					<div
						style={{
							display: "flex",
							justifyContent: "flex-end",
							gap: "0.5rem",
							width: "100%",
						}}
					>
						<ExpandableSearch
							closeButtonLabelText="Clear search input"
							id="search-courses"
							labelText="Search"
							placeholder="Search courses"
							size="md"
							type="search"
						/>
						<Button
							kind="primary"
							size="md"
							renderIcon={Add}
							onClick={() => setCreateModalOpen(true)}
						>
							Create Course
						</Button>
					</div>
				}
				renderCell={(cell) => {
					if (cell.info.header === "courseName") {
						const v = cell.value as { primary: string; secondary: string };
						return (
							<>
								<p style={{ fontWeight: 400, marginBottom: "0.125rem" }}>
									{v.primary}
								</p>
								<p className={resourceTableStyles.secondaryText}>
									{v.secondary}
								</p>
							</>
						);
					}
					if (cell.info.header === "status") {
						return (
							<Tag type={statusTagType(String(cell.value))} size="sm">
								{String(cell.value)}
							</Tag>
						);
					}
					return null;
				}}
			/>
			<CreateCourseModal
				open={createModalOpen}
				onRequestClose={() => setCreateModalOpen(false)}
				onSuccess={() => {
					setCreateModalOpen(false);
					void queryClient.invalidateQueries({ queryKey: ["courses"] });
				}}
			/>
		</PageLayout>
	);
}
