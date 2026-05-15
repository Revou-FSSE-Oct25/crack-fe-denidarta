"use client";

import { useState } from "react";
import { Button, Tag, Stack, Search } from "@carbon/react";
import { Add, Edit } from "@carbon/icons-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchAssignments } from "@/services/assignments.service";
import { statusTagType } from "@/utils/tag-type";
import { DATE_LOCALE } from "@/constants";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection, {
	resourceTableStyles,
} from "@/components/ResourceTableSection";

const ASSIGNMENT_HEADERS = [
	{ key: "title", header: "Assignment & Course" },
	{ key: "status", header: "Status" },
	{ key: "dueDate", header: "Due Date" },
	{ key: "submitted", header: "Submitted" },
	{ key: "minPoints", header: "Min Points" },
	{ key: "createdAt", header: "Created At" },
	{ key: "action", header: "" },
];

export default function AssignmentsPage() {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { data, isLoading, error } = useQuery({
		queryKey: ["assignments", page, pageSize],
		queryFn: () => fetchAssignments(page, pageSize),
	});

	const assignments = data?.data ?? [];
	const total = data?.meta.total ?? 0;

	const rows = assignments.map((assignment) => ({
		id: assignment.id,
		title: assignment.title,
		status: assignment.status,
		dueDate: new Date(assignment.dueDate).toLocaleDateString(DATE_LOCALE),
		submitted: `${assignment.submitted ?? 0} / ${assignment.toSubmit ?? 0}`,
		minPoints: assignment.minPoints,
		createdAt: new Date(assignment.createdAt).toLocaleDateString(DATE_LOCALE),
		action: assignment.id,
	}));

	return (
		<PageLayout>
			<PageHeader
				title="Assignments"
				subtitle={isLoading ? "..." : `${total} assignments total`}
				actions={
					<Button
						kind="primary"
						size="md"
						renderIcon={Add}
						onClick={() => router.push("/create-assignment")}
					>
						Create Assignment
					</Button>
				}
			/>
			<ResourceTableSection
				loading={isLoading}
				error={error ? error.message : null}
				headers={ASSIGNMENT_HEADERS}
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
						id="search-assignments"
						labelText="Search"
						placeholder="Search assignments (coming soon)"
						size="lg"
						type="search"
						disabled
					/>
				}
				renderCell={(cell, row) => {
					if (cell.info.header === "title") {
						const assignment = assignments.find((a) => a.id === row.id);
						return (
							<>
								<div style={{ fontWeight: 600 }}>{String(cell.value)}</div>
								<p className={resourceTableStyles.secondaryText}>
									{assignment?.course?.name ?? "-"}
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
					if (cell.info.header === "action") {
						return (
							<Stack orientation="horizontal" gap={2}>
								<Button
									kind="ghost"
									size="sm"
									onClick={() =>
										router.push(
											`/dashboard-admin/assignments/${String(cell.value)}`,
										)
									}
								>
									View
								</Button>
								<Button
									kind="ghost"
									size="sm"
									renderIcon={Edit}
									onClick={() =>
										router.push(`/edit-assignment?id=${String(cell.value)}`)
									}
								>
									Edit
								</Button>
							</Stack>
						);
					}
					return null;
				}}
			/>
		</PageLayout>
	);
}
