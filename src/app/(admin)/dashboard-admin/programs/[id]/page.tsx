"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	InlineNotification,
	SkeletonText,
	Button,
	Tag,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProgram } from "@/services/programs.service";
import { enrolledStudentHeaders, programCourseHeaders } from "@/constants/programs";
import PageLayout, { PageHeader, PageSection } from "@/components/PageLayout";
import ResourceTableSection from "@/components/ResourceTableSection";
import dynamic from "next/dynamic";

const EnrollStudentModal = dynamic(
	() => import("@/components/Modals/EnrollStudentModal"),
	{ ssr: false },
);
import { statusTagType } from "@/utils/tag-type";

export default function ProgramDetailPage() {
	const { id } = useParams<{ id: string }>();
	const queryClient = useQueryClient();
	const [enrollModalOpen, setEnrollModalOpen] = useState(false);

	const { data: program, isLoading, error } = useQuery({
		queryKey: ["program", id],
		queryFn: () => fetchProgram(id!),
		enabled: !!id,
	});

	const enrolledUserIds = (program?.students ?? []).map((s) => s.userId);

	const studentRows = (program?.students ?? []).map((s) => ({
		id: s.userId,
		fullName: s.fullName ?? "—",
		status: "enrolled",
		enrolledAt: "—",
	}));

	const courseRows = (program?.courses ?? []).map((c) => ({
		id: c.courseId,
		courseTitle: c.courseTitle,
		instructor: c.instructor?.profile?.fullName ?? "—",
	}));

	const subtitle = program
		? [
				`Created by ${program.createdBy?.fullName ?? program.createdBy?.username}`,
				program.headOfProgram?.fullName
					? `Head: ${program.headOfProgram.fullName}`
					: null,
			]
				.filter(Boolean)
				.join(" · ")
		: undefined;

	return (
		<PageLayout>
			<Breadcrumb>
				<BreadcrumbItem href="/dashboard-admin/programs">Programs</BreadcrumbItem>
				<BreadcrumbItem isCurrentPage>
					{isLoading ? "..." : (program?.name ?? id)}
				</BreadcrumbItem>
			</Breadcrumb>

			{isLoading ? (
				<SkeletonText width="40%" />
			) : error ? (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={error instanceof Error ? error.message : "Failed to load program"}
					lowContrast
				/>
			) : (
				<PageHeader title={program!.name} subtitle={subtitle} />
			)}

			<PageSection>
				<h2 style={{ marginBottom: "1rem" }}>Enrolled Students</h2>
				<ResourceTableSection
					loading={isLoading}
					error={null}
					headers={enrolledStudentHeaders}
					rows={studentRows}
					toolbar={
						<div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
							<Button
								kind="primary"
								size="md"
								renderIcon={Add}
								onClick={() => setEnrollModalOpen(true)}
								disabled={isLoading}
							>
								Enroll Student
							</Button>
						</div>
					}
					renderCell={(cell) => {
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
			</PageSection>

			<PageSection>
				<h2 style={{ marginBottom: "1rem" }}>Courses</h2>
				<ResourceTableSection
					loading={isLoading}
					error={null}
					headers={programCourseHeaders}
					rows={courseRows}
				/>
			</PageSection>

			<EnrollStudentModal
				open={enrollModalOpen}
				onRequestClose={() => setEnrollModalOpen(false)}
				programId={id!}
				enrolledUserIds={enrolledUserIds}
				onSuccess={() => {
					setEnrollModalOpen(false);
					void queryClient.invalidateQueries({ queryKey: ["program", id] });
				}}
			/>
		</PageLayout>
	);
}
