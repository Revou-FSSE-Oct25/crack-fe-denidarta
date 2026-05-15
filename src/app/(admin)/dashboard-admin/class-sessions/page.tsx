"use client";

import { useState } from "react";
import { Button, Tag, Search } from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchClassSessions } from "@/services/class-sessions.service";
import CreateClassSessionModal from "@/components/Modals/CreateClassSessionModal";
import { classSessionTableHeaders } from "@/constants/class-sessions";
import { statusTagType } from "@/utils/tag-type";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection, {
	resourceTableStyles,
} from "@/components/ResourceTableSection";
import type { ClassSession } from "@/types/index.type";

function formatTime(isoString: string): string {
	return (
		new Date(isoString).toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "UTC",
		}) + " WIB"
	);
}

export default function ClassSessionsPage() {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [modalOpen, setModalOpen] = useState(false);

	const { data, isLoading, error } = useQuery({
		queryKey: ["class-sessions", page, pageSize],
		queryFn: () => fetchClassSessions(page, pageSize),
	});

	const sessions = (data?.data ?? []) as ClassSession[];
	const total = data?.meta.total ?? 0;

	const rows = sessions.map((session) => ({
		id: String(session.id),
		sessionInfo: {
			primary: session.title,
			secondary: session.course?.name ?? "—",
		},
		sessionDate: new Date(session.sessionDate).toLocaleDateString("id-ID"),
		timeInfo: {
			primary: formatTime(session.startTime),
			secondary: formatTime(session.endTime),
		},
		status: session.status,
		instructor: session.instructor?.profile?.fullName ?? "—",
		actions: session.id,
	}));

	return (
		<PageLayout>
			<PageHeader
				title="Class Sessions"
				subtitle={isLoading ? "..." : `${total} class sessions total`}
				actions={
					<Button
						kind="primary"
						size="md"
						renderIcon={Add}
						onClick={() => setModalOpen(true)}
					>
						Create Session
					</Button>
				}
			/>
			<ResourceTableSection
				loading={isLoading}
				error={error ? error.message : null}
				headers={classSessionTableHeaders}
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
						id="search-sessions"
						labelText="Search"
						placeholder="Search sessions (coming soon)"
						size="md"
						type="search"
						disabled
					/>
				}
				renderCell={(cell) => {
					if (cell.info.header === "sessionInfo") {
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
					if (cell.info.header === "timeInfo") {
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
					if (cell.info.header === "actions") {
						return (
							<Button
								kind="ghost"
								size="sm"
								href={`/dashboard-admin/class-sessions/${String(cell.value)}`}
							>
								Attendance
							</Button>
						);
					}
					return null;
				}}
			/>
			<CreateClassSessionModal
				open={modalOpen}
				onRequestClose={() => setModalOpen(false)}
				onSuccess={() => {
					setModalOpen(false);
					void queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
				}}
			/>
		</PageLayout>
	);
}
