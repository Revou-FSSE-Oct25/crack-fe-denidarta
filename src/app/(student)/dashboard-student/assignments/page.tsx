"use client";

import { useRouter } from "next/navigation";
import { Button, Tag } from "@carbon/react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyAssignments } from "@/services/assignments.service";
import type { Assignment } from "@/types/index.type";
import { statusTagType } from "@/utils/tag-type";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection from "@/components/ResourceTableSection";

const headers = [
	{ key: "title", header: "Assignment" },
	{ key: "courseName", header: "Course" },
	{ key: "dueDate", header: "Due Date" },
	{ key: "assignmentStatus", header: "Status" },
	{ key: "submissionStatus", header: "My Submission" },
];

function deriveSubmissionStatus(a: Assignment): string {
	const sub = a.submissions?.[0];
	if (!sub) return "Not Submitted";
	if (sub.status === "graded")
		return sub.passed ? "Graded — Passed" : "Graded — Failed";
	return sub.status === "submitted" ? "Submitted" : "Draft";
}

export default function StudentAssignmentsPage() {
	const router = useRouter();

	const { data: assignments = [], isLoading, error } = useQuery({
		queryKey: ["my-assignments"],
		queryFn: fetchMyAssignments,
	});

	const rows = assignments.map((a) => ({
		id: a.id,
		title: a.title,
		courseName: a.course?.name ?? "—",
		dueDate: new Date(a.dueDate).toLocaleDateString("id-ID"),
		assignmentStatus: a.status,
		submissionStatus: deriveSubmissionStatus(a),
	}));

	return (
		<PageLayout>
			<PageHeader
				title="My Assignments"
				subtitle={
					isLoading
						? "..."
						: `${rows.length} assignment${rows.length !== 1 ? "s" : ""}`
				}
			/>
			<ResourceTableSection
				loading={isLoading}
				error={error ? error.message : null}
				headers={headers}
				rows={rows}
				renderCell={(cell, row) => {
					if (cell.info.header === "title") {
						return (
							<Button
								kind="ghost"
								size="sm"
								onClick={() =>
									router.push(`/dashboard-student/assignments/${row.id}`)
								}
							>
								{String(cell.value)}
							</Button>
						);
					}
					if (
						cell.info.header === "assignmentStatus" ||
						cell.info.header === "submissionStatus"
					) {
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
