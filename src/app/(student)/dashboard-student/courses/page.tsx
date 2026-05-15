"use client";

import { useState } from "react";
import { Tag, Search } from "@carbon/react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/services/courses.service";
import { courseTableHeaders } from "@/constants/courses";
import { statusTagType } from "@/utils/tag-type";
import { DATE_LOCALE } from "@/constants";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection, {
	resourceTableStyles,
} from "@/components/ResourceTableSection";

export default function StudentCoursesPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { data, isLoading, error } = useQuery({
		queryKey: ["student-courses", page, pageSize],
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
		instructor: course.instructor?.profile?.fullName ?? "—",
		status: course.status,
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
				title="My Courses"
				subtitle={isLoading ? "..." : `${total} courses enrolled`}
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
					<Search
						closeButtonLabelText="Clear search input"
						id="search-student-courses"
						labelText="Search"
						placeholder="Search courses (coming soon)"
						size="md"
						type="search"
						disabled
					/>
				}
				renderCell={(cell) => {
					if (cell.info.header === "courseName") {
						const v = cell.value as { primary: string; secondary: string };
						return (
							<>
								<p style={{ fontWeight: 400, marginBottom: "0.125rem" }}>
									{v.primary}
								</p>
								<p className={resourceTableStyles.secondaryText}>{v.secondary}</p>
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
		</PageLayout>
	);
}
