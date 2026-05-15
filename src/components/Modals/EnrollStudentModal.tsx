"use client";

import { Modal, ComboBox, InlineNotification, Stack } from "@carbon/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "@/services/users.service";
import { enrollStudent } from "@/services/enrollments.service";

interface EnrollStudentModalProps {
	open: boolean;
	onRequestClose: () => void;
	onSuccess: () => void;
	programId: string;
	enrolledUserIds: string[];
}

interface ComboItem {
	id: string;
	label: string;
}

export default function EnrollStudentModal({
	open,
	onRequestClose,
	onSuccess,
	programId,
	enrolledUserIds,
}: EnrollStudentModalProps) {
	const [selected, setSelected] = useState<ComboItem | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { data, isLoading: fetchingStudents } = useQuery({
		queryKey: ["students", "all"],
		queryFn: () => fetchStudents(1, 200),
		enabled: open,
	});

	const items: ComboItem[] = (data?.data ?? [])
		.filter((u) => !enrolledUserIds.includes(u.id))
		.map((u) => ({
			id: u.id,
			label: u.profile?.fullName ?? u.username,
		}));

	const handleClose = () => {
		setSelected(null);
		setError(null);
		onRequestClose();
	};

	const handleSubmit = () => {
		if (!selected) return;
		setLoading(true);
		setError(null);
		enrollStudent(programId, selected.id)
			.then(() => {
				handleClose();
				onSuccess();
			})
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : "Failed to enroll student");
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return (
		<Modal
			aria-label="Enroll student modal"
			modalHeading="Enroll Student"
			open={open}
			primaryButtonText={loading ? "Enrolling..." : "Enroll"}
			secondaryButtonText="Cancel"
			primaryButtonDisabled={loading || !selected}
			preventCloseOnClickOutside
			onRequestClose={handleClose}
			onRequestSubmit={handleSubmit}
			onSecondarySubmit={handleClose}
		>
			<Stack gap={5}>
				{error && (
					<InlineNotification
						kind="error"
						title="Error"
						subtitle={error}
						lowContrast
						onClose={() => setError(null)}
					/>
				)}
				<ComboBox
					id="enroll-student-combo"
					titleText="Select Student"
					placeholder={fetchingStudents ? "Loading students..." : "Search by name or username"}
					items={items}
					itemToString={(item) => (item ? item.label : "")}
					selectedItem={selected}
					onChange={({ selectedItem }) => setSelected(selectedItem ?? null)}
					disabled={fetchingStudents || loading}
				/>
				{!fetchingStudents && items.length === 0 && (
					<p style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)" }}>
						All students are already enrolled in this program.
					</p>
				)}
			</Stack>
		</Modal>
	);
}
