"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	Button,
	DataTable,
	DataTableSkeleton,
	Heading,
	InlineNotification,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Tag,
} from "@carbon/react";
import { apiFetch } from "@/lib/api-client";
import { ClassSession } from "@/types/index.type";
import { statusTagType } from "@/utils/tag-type";
import VerifyAttendanceModal, {
	type VerifyAttendanceRecord,
} from "@/components/Modals/VerifyAttendanceModal";
import styles from "../class-sessions.module.scss";

interface AttendanceRecord extends VerifyAttendanceRecord {
	isVerified: boolean;
	verifiedBy: string | null;
	verifiedAt: string | null;
}

const attendanceHeaders = [
	{ key: "name", header: "Student" },
	{ key: "status", header: "Status" },
	{ key: "isVerified", header: "Is Verified" },
	{ key: "verifiedBy", header: "Verified By" },
	{ key: "verifiedAt", header: "Verified At" },
	{ key: "actions", header: "" },
];

export default function SessionAttendancePage() {
	const { sessionId } = useParams<{ sessionId: string }>();

	const [session, setSession] = useState<ClassSession | null>(null);
	const [records, setRecords] = useState<AttendanceRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [verifyRecord, setVerifyRecord] = useState<AttendanceRecord | null>(
		null,
	);

	useEffect(() => {
		let mounted = true;

		async function fetchData() {
			try {
				const [sessionRes, attendanceRes] = await Promise.all([
					apiFetch(`/class-sessions/${sessionId}`),
					apiFetch(`/attendances/session/${sessionId}`),
				]);

				if (!sessionRes.ok)
					throw new Error(`Failed to load session (${sessionRes.status})`);
				if (!attendanceRes.ok)
					throw new Error(
						`Failed to load attendance (${attendanceRes.status})`,
					);

				const { data: sessionData } = (await sessionRes.json()) as {
					data: ClassSession;
				};
				const { data: attendanceData } = (await attendanceRes.json()) as {
					data: AttendanceRecord[];
				};

				if (!mounted) return;
				setSession(sessionData);
				setRecords(attendanceData ?? []);
			} catch (err) {
				if (!mounted) return;
				setError(
					err instanceof Error ? err.message : "An unexpected error occurred",
				);
			} finally {
				if (mounted) setLoading(false);
			}
		}

		void fetchData();
		return () => {
			mounted = false;
		};
	}, [sessionId]);

	const rows = records.map((r) => ({
		id: r.id,
		name: r.user.profile?.fullName ?? r.user.username,
		status: r.status,
		isVerified: r.isVerified,
		verifiedBy: r.verifiedBy ?? "—",
		verifiedAt: r.verifiedAt
			? new Date(r.verifiedAt).toLocaleString("id-ID")
			: "—",
		actions: r.id,
	}));

	return (
		<div className={styles.container}>
			<Breadcrumb>
				<BreadcrumbItem href="/dashboard-admin">Dashboard</BreadcrumbItem>
				<BreadcrumbItem href="/dashboard-admin/class-sessions">
					Class Sessions
				</BreadcrumbItem>
				<BreadcrumbItem isCurrentPage>Attendance</BreadcrumbItem>
			</Breadcrumb>

			<div className={styles.header}>
				<div className={styles.headerContent}>
					<Heading>Attendance</Heading>
					<p className={styles.subtitle}>
						{session
							? `${session.title} · ${new Date(session.sessionDate).toLocaleDateString("id-ID")}`
							: "Loading..."}
					</p>
				</div>
			</div>

			{error !== null && (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={error}
					lowContrast
				/>
			)}

			{loading ? (
				<DataTableSkeleton headers={attendanceHeaders} rowCount={5} />
			) : (
				<DataTable rows={rows} headers={attendanceHeaders}>
					{({
						rows,
						headers,
						getTableProps,
						getHeaderProps,
						getRowProps,
						getTableContainerProps,
					}) => (
						<TableContainer {...getTableContainerProps()}>
							<Table {...getTableProps()} size="xl">
								<TableHead>
									<TableRow>
										{headers.map((header) => (
											<TableHeader
												{...getHeaderProps({ header })}
												key={header.key}
											>
												{header.header}
											</TableHeader>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.length === 0 ? (
										<TableRow>
											<TableCell colSpan={attendanceHeaders.length}>
												No attendance records found for this session.
											</TableCell>
										</TableRow>
									) : (
										rows.map((row) => (
											<TableRow {...getRowProps({ row })} key={row.id}>
												{row.cells.map((cell) => {
													if (cell.info.header === "status") {
														return (
															<TableCell key={cell.id}>
																<Tag
																	type={statusTagType(String(cell.value))}
																	size="sm"
																>
																	{String(cell.value)}
																</Tag>
															</TableCell>
														);
													}
													if (cell.info.header === "isVerified") {
														return (
															<TableCell key={cell.id}>
																{cell.value ? "✓" : "—"}
															</TableCell>
														);
													}
													if (cell.info.header === "actions") {
														const record = records.find(
															(r) => r.id === String(cell.value),
														);
														return (
															<TableCell key={cell.id}>
																<Button
																	kind="ghost"
																	size="sm"
																	disabled={record?.isVerified ?? false}
																	onClick={() =>
																		record && setVerifyRecord(record)
																	}
																>
																	Verify Attendance
																</Button>
															</TableCell>
														);
													}
													return (
														<TableCell key={cell.id}>
															{cell.value as string}
														</TableCell>
													);
												})}
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</DataTable>
			)}
			<VerifyAttendanceModal
				record={verifyRecord}
				onRequestClose={() => setVerifyRecord(null)}
				onSuccess={(updated) => {
					setRecords((prev) =>
						prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
					);
					setVerifyRecord(null);
				}}
			/>
		</div>
	);
}
