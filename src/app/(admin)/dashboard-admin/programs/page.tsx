"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Button,
	ExpandableSearch,
	OverflowMenu,
	OverflowMenuItem,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPrograms } from "@/services/programs.service";
import { programTableHeaders } from "@/constants/programs";
import { DATE_LOCALE } from "@/constants";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection from "@/components/ResourceTableSection";
import CreateProgramModal from "@/components/Modals/CreateProgramModal";

export default function ProgramsPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [modalOpen, setModalOpen] = useState(false);

	const { data, isLoading, error } = useQuery({
		queryKey: ["programs", page, pageSize],
		queryFn: () => fetchPrograms(page, pageSize),
	});

	const programs = data?.data ?? [];
	const total = data?.meta.total ?? 0;

	const rows = programs.map((program) => ({
		id: String(program.programId),
		name: program.name,
		creator: program.createdBy?.fullName ?? program.createdBy?.username,
		courseCount: String(program.courses?.length ?? 0),
		enrolledStudents: String(program.students?.length ?? 0),
		createdAt: new Date(program.createdAt).toLocaleString(DATE_LOCALE),
		action: "",
	}));

	return (
		<PageLayout>
			<PageHeader
				title="Programs"
				subtitle={isLoading ? "..." : `${total} programs total`}
			/>
			<ResourceTableSection
				loading={isLoading}
				error={error ? error.message : null}
				headers={programTableHeaders}
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
							id="search-programs"
							labelText="Search"
							placeholder="Search programs (coming soon)"
							size="md"
							type="search"
						/>
						<Button
							kind="primary"
							size="md"
							renderIcon={Add}
							onClick={() => setModalOpen(true)}
						>
							Create Program
						</Button>
					</div>
				}
				renderCell={(cell, row) => {
					if (cell.info.header === "action") {
						return (
							<OverflowMenu size="lg">
								<OverflowMenuItem
									itemText="View"
									onClick={() =>
										router.push(`/dashboard-admin/programs/${row.id}`)
									}
								/>
							</OverflowMenu>
						);
					}
					return null;
				}}
			/>
			<CreateProgramModal
				open={modalOpen}
				onRequestClose={() => setModalOpen(false)}
				onSuccess={() => {
					setModalOpen(false);
					void queryClient.invalidateQueries({ queryKey: ["programs"] });
				}}
			/>
		</PageLayout>
	);
}
