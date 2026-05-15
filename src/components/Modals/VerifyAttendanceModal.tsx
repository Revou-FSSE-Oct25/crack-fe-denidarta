"use client";

import { Modal, Select, SelectItem } from "@carbon/react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";

const ATTENDANCE_STATUSES = [
	"present",
	"absent",
	"late",
	"excused",
	"unverified",
] as const;

type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface VerifyAttendanceRecord {
	id: string;
	status: string;
	createdAt: string;
	user: {
		username: string;
		profile: { fullName: string | null } | null;
	};
}

interface VerifyAttendanceModalProps {
	record: VerifyAttendanceRecord | null;
	onRequestClose: () => void;
	onSuccess: (updated: VerifyAttendanceRecord) => void;
}

export default function VerifyAttendanceModal({
	record,
	onRequestClose,
	onSuccess,
}: VerifyAttendanceModalProps) {
	const [status, setStatus] = useState<AttendanceStatus>("present");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (record) setStatus((record.status as AttendanceStatus) ?? "present");
	}, [record]);

	const studentName =
		record?.user.profile?.fullName ?? record?.user.username ?? "—";

	const submittedAt = record?.createdAt
		? new Date(record.createdAt).toLocaleString("id-ID")
		: "—";

	async function handleSubmit() {
		if (!record) return;
		setSubmitting(true);
		try {
			const res = await apiFetch(`/attendances/${record.id}/verify`, {
				method: "PATCH",
				body: JSON.stringify({ isVerified: true, status }),
			});
			if (!res.ok) throw new Error(`Error ${res.status}`);
			const { data: updated } = (await res.json()) as {
				data: VerifyAttendanceRecord;
			};
			onSuccess(updated);
			onRequestClose();
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Modal
			aria-label="Verify attendance modal"
			modalHeading="Verify Attendance"
			open={record !== null}
			primaryButtonText={submitting ? "Verifying..." : "Verify"}
			primaryButtonDisabled={submitting}
			secondaryButtonText="Cancel"
			onRequestClose={onRequestClose}
			onRequestSubmit={() => void handleSubmit()}
			onSecondarySubmit={onRequestClose}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				<div>
					<p
						style={{
							fontSize: "0.75rem",
							color: "#525252",
							marginBottom: "0.25rem",
						}}
					>
						Student
					</p>
					<p style={{ fontWeight: 600, margin: 0 }}>{studentName}</p>
				</div>

				<div>
					<p
						style={{
							fontSize: "0.75rem",
							color: "#525252",
							marginBottom: "0.25rem",
						}}
					>
						Submitted at
					</p>
					<p style={{ margin: 0 }}>{submittedAt}</p>
				</div>

				<Select
					id="verify-attendance-status"
					labelText="Attendance Status"
					value={status}
					onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
				>
					{ATTENDANCE_STATUSES.map((s) => (
						<SelectItem
							key={s}
							value={s}
							text={s.charAt(0).toUpperCase() + s.slice(1)}
						/>
					))}
				</Select>
			</div>
		</Modal>
	);
}
