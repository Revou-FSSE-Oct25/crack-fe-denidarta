"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, SelectItem, Tag } from "@carbon/react";
import { Search } from "@carbon/react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCourses } from "@/services/courses.service";
import { statusTagType } from "@/utils/tag-type";
import { DATE_LOCALE } from "@/constants";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection, {
	resourceTableStyles,
} from "@/components/ResourceTableSection";

const headers = [
	{ key: "courseName", header: "Course Name" },
	{ key: "instructor", header: "Instructor" },
	{ key: "status", header: "Status" },
	{ key: "startedAt", header: "Start Date" },
	{ key: "endedAt", header: "End Date" },
	{ key: "description", header: "Description" },
] as const;

const STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "draft", label: "Draft" },
	{ value: "active", label: "Active" },
	{ value: "archived", label: "Archived" },
	{ value: "completed", label: "Completed" },
];

export default function StudentCoursesPage() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	const {
		data: courses = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["student-courses-all"],
		queryFn: fetchAllCourses,
	});

	const filtered = useMemo(
		() =>
			courses
				.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
				.filter((c) => statusFilter === "" || c.status === statusFilter),
		[courses, searchTerm, statusFilter],
	);

	const rows = filtered.map((course) => ({
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
				subtitle={
					isLoading
						? "..."
						: `${filtered.length} course${filtered.length !== 1 ? "s" : ""}`
				}
			/>
			<ResourceTableSection
				loading={isLoading}
				error={error ? error.message : null}
				headers={headers}
				rows={rows}
				toolbar={
					<div
						style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}
					>
						<Search
							closeButtonLabelText="Clear search input"
							id="search-student-courses"
							labelText="Search courses"
							placeholder="Search by course name"
							size="md"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Select
							id="status-filter"
							labelText="Status"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							style={{ minWidth: "160px" }}
						>
							{STATUS_OPTIONS.map((o) => (
								<SelectItem key={o.value} value={o.value} text={o.label} />
							))}
						</Select>
					</div>
				}
				renderCell={(cell, row) => {
					if (cell.info.header === "courseName") {
						const v = cell.value as { primary: string; secondary: string };
						return (
							<>
								<Button
									kind="ghost"
									size="sm"
									onClick={() =>
										router.push(`/dashboard-student/courses/${row.id}`)
									}
									style={{ paddingInline: 0 }}
								>
									{v.primary}
								</Button>
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
		</PageLayout>
	);
}
