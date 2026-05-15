"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Button,
	Checkbox,
	DataTable,
	Modal,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Tag,
	TextArea,
	DataTableSkeleton,
	InlineNotification,
	SkeletonText,
	ContainedList,
	ContainedListItem,
	Breadcrumb,
	BreadcrumbItem,
} from "@carbon/react";
import { Edit } from "@carbon/icons-react";
import { apiFetch } from "@/lib/api-client";
import { Assignment, SubmissionDetail } from "@/types/index.type";
import { statusTagType } from "@/utils/tag-type";
import { DATE_LOCALE, submissionHeaders } from "@/constants";
import styles from "./assignment-detail.module.scss";

class HttpError extends Error {
	constructor(
		public status: number,
		msg: string,
	) {
		super(msg);
		this.name = "HttpError";
	}
}

function submissionStatusTagType(status: string) {
	const map: Record<string, "blue" | "teal" | "green" | "gray"> = {
		notSubmitted: "gray",
		submitted: "blue",
		graded: "teal",
	};
	return map[status] ?? "gray";
}

type SubmissionItem = NonNullable<Assignment["submissions"]>[number];

interface GradingState {
	submission: SubmissionItem;
	detail: SubmissionDetail | null;
	loadingDetail: boolean;
	checked: boolean[];
	feedback: string;
	submitting: boolean;
	error: string | null;
}

export default function AssignmentDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();

	const [assignment, setAssignment] = useState<Assignment | null>(null);
	const [loadingAssignment, setLoadingAssignment] = useState(true);
	const [assignmentError, setAssignmentError] = useState<string | null>(null);
	const [grading, setGrading] = useState<GradingState | null>(null);

	const fetchAssignment = useCallback(
		async (signal?: AbortSignal) => {
			if (!id) return;
			setLoadingAssignment(true);
			setAssignmentError(null);
			try {
				const res = await apiFetch(`/assignments/${id}`, { signal });
				if (!res.ok)
					throw new HttpError(
						res.status,
						`Failed to fetch assignment (${res.status})`,
					);
				const { data } = (await res.json()) as { data: Assignment };
				setAssignment(data);
			} catch (err) {
				if (err instanceof DOMException && err.name === "AbortError") return;
				setAssignmentError(
					err instanceof Error ? err.message : "Unexpected error",
				);
			} finally {
				setLoadingAssignment(false);
			}
		},
		[id],
	);

	useEffect(() => {
		const controller = new AbortController();
		void fetchAssignment(controller.signal);
		return () => controller.abort();
	}, [fetchAssignment]);

	const criteria = assignment?.gradingCriteria ?? [];

	const openGradingModal = (submission: SubmissionItem) => {
		setGrading({
			submission,
			detail: null,
			loadingDetail: true,
			checked: criteria.map(() => false),
			feedback: "",
			submitting: false,
			error: null,
		});

		void apiFetch(`/submissions/${submission.submissionId}`)
			.then((res) => res.json())
			.then(({ data }: { data: SubmissionDetail }) => {
				setGrading((prev) =>
					prev ? { ...prev, detail: data, loadingDetail: false } : prev,
				);
			})
			.catch(() => {
				setGrading((prev) => (prev ? { ...prev, loadingDetail: false } : prev));
			});
	};

	const closeModal = () => {
		if (grading?.submitting) return;
		setGrading(null);
	};

	const toggleCriteria = (index: number) => {
		setGrading((prev) => {
			if (!prev) return prev;
			const next = [...prev.checked];
			next[index] = !next[index];
			return { ...prev, checked: next };
		});
	};

	const computedGrade = grading
		? criteria.reduce(
				(sum, c, i) => sum + (grading.checked[i] ? c.points : 0),
				0,
			)
		: 0;

	const handleFinishGrading = async () => {
		if (!grading) return;
		setGrading((prev) => prev && { ...prev, submitting: true, error: null });

		const body = {
			criteriaScores: criteria.map((_, i) => ({
				criteriaIndex: i,
				checked: grading.checked[i],
			})),
			...(grading.feedback.trim() && { feedback: grading.feedback.trim() }),
		};

		try {
			const res = await apiFetch(
				`/submissions/${grading.submission.submissionId}/grade`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				},
			);
			if (!res.ok) {
				const json = (await res.json().catch(() => ({}))) as {
					message?: string;
				};
				throw new Error(json.message ?? `Error ${res.status}`);
			}
			setGrading(null);
			await fetchAssignment();
		} catch (err) {
			setGrading((prev) =>
				prev
					? {
							...prev,
							submitting: false,
							error: err instanceof Error ? err.message : "Unexpected error",
						}
					: prev,
			);
		}
	};

	const submissions = assignment?.submissions ?? [];

	const submissionRows = submissions.map((s) => ({
		id: s.submissionId,
		userFullName: s.fullName ?? "-",
		userId: s.userId,
		status: s.status,
		grade: s.grade != null ? String(s.grade) : "-",
		passed: s.passed != null ? (s.passed ? "Yes" : "No") : "-",
		submittedAt: s.dateSubmitted
			? new Date(s.dateSubmitted).toLocaleDateString(DATE_LOCALE)
			: "-",
		submittedAtTime: s.dateSubmitted
			? new Date(s.dateSubmitted).toLocaleTimeString(DATE_LOCALE, {
					hour: "2-digit",
					minute: "2-digit",
				})
			: null,
		feedback: s.feedback ?? "-",
		actions: s.submissionId,
	}));

	return (
		<div className={styles.container}>
			<div className={styles.topSection}>
				<Breadcrumb className={styles.breadcrumb}>
					<BreadcrumbItem href="/dashboard-admin">Dashboard</BreadcrumbItem>
					<BreadcrumbItem href="/dashboard-admin/assignments">
						Assignments
					</BreadcrumbItem>
					<BreadcrumbItem isCurrentPage>Assignment Detail</BreadcrumbItem>
				</Breadcrumb>
				<Button
					kind="ghost"
					size="sm"
					renderIcon={Edit}
					onClick={() => router.push(`/edit-assignment?id=${id}`)}
				>
					Edit Assignment
				</Button>
			</div>

			{assignmentError && (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={assignmentError}
					lowContrast
					className={styles.notification}
				/>
			)}

			{loadingAssignment ? (
				<SkeletonText paragraph lineCount={4} className={styles.skeleton} />
			) : assignment ? (
				<div className={styles.assignmentInfo}>
					<h1 className={styles.title}>{assignment.title}</h1>
					<p className={styles.courseName}>{assignment.course?.name}</p>
					{assignment.description && (
						<p className={styles.description}>{assignment.description}</p>
					)}
					<div className={styles.metaInfo}>
						<span>
							<strong>Status: </strong>
							<Tag type={statusTagType(assignment.status)} size="sm">
								{assignment.status}
							</Tag>
						</span>
						<span>
							<strong>Due Date:</strong>{" "}
							{new Date(assignment.dueDate).toLocaleDateString(DATE_LOCALE)}{" "}
							<span
								style={{
									fontSize: "0.85em",
									color: "var(--cds-text-secondary)",
								}}
							>
								{new Date(assignment.dueDate).toLocaleTimeString(DATE_LOCALE, {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						</span>
						<span>
							<strong>Min Points:</strong> {assignment.minPoints}
						</span>
					</div>
					{criteria.length > 0 && (
						<div style={{ marginTop: "1.5rem" }}>
							<ContainedList label="Grading Criteria" kind="on-page">
								{criteria.map((c, i) => (
									<ContainedListItem key={i}>
										<strong>{c.label}</strong> ({c.points} pts) -{" "}
										{c.description}
									</ContainedListItem>
								))}
							</ContainedList>
						</div>
					)}
				</div>
			) : null}

			<h2 className={styles.sectionTitle}>Submissions</h2>

			{loadingAssignment ? (
				<DataTableSkeleton headers={submissionHeaders} rowCount={5} />
			) : (
				<DataTable rows={submissionRows} headers={submissionHeaders}>
					{({
						rows,
						headers,
						getTableProps,
						getHeaderProps,
						getRowProps,
						getTableContainerProps,
					}) => (
						<TableContainer
							title={`${submissions.length} submission${submissions.length !== 1 ? "s" : ""}`}
							{...getTableContainerProps()}
						>
							<Table {...getTableProps()}>
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
											<TableCell colSpan={submissionHeaders.length}>
												No submissions yet.
											</TableCell>
										</TableRow>
									) : (
										rows.map((row) => {
											const sub = submissions.find(
												(s) => s.submissionId === row.id,
											)!;
											return (
												<TableRow {...getRowProps({ row })} key={row.id}>
													{row.cells.map((cell) => {
														if (cell.info.header === "status") {
															return (
																<TableCell key={cell.id}>
																	<Tag
																		type={submissionStatusTagType(
																			String(cell.value),
																		)}
																		size="sm"
																	>
																		{String(cell.value)}
																	</Tag>
																</TableCell>
															);
														}
														if (cell.info.header === "submittedAt") {
															const timeVal = submissionRows.find(
																(r) => r.id === row.id,
															)?.submittedAtTime;
															return (
																<TableCell key={cell.id}>
																	<span>{cell.value}</span>
																	{timeVal && (
																		<>
																			<br />
																			<span
																				style={{
																					fontSize: "0.75rem",
																					color: "var(--cds-text-secondary)",
																				}}
																			>
																				{timeVal}
																			</span>
																		</>
																	)}
																</TableCell>
															);
														}
														if (cell.info.header === "actions") {
															return (
																<TableCell key={cell.id}>
																	<Button
																		kind="tertiary"
																		size="sm"
																		disabled={criteria.length === 0}
																		onClick={() => openGradingModal(sub)}
																	>
																		Grading
																	</Button>
																</TableCell>
															);
														}
														return (
															<TableCell key={cell.id}>{cell.value}</TableCell>
														);
													})}
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</DataTable>
			)}

			{/* Grading Modal */}
			{grading && (
				<Modal
					open
					modalHeading={`Grade: ${grading.submission.fullName ?? "Student"}`}
					primaryButtonText={
						grading.submitting ? "Saving…" : "Finished Grading"
					}
					secondaryButtonText="Cancel"
					onRequestSubmit={() => void handleFinishGrading()}
					onRequestClose={closeModal}
					onSecondarySubmit={closeModal}
					primaryButtonDisabled={grading.submitting}
					size="sm"
				>
					{grading.error && (
						<InlineNotification
							kind="error"
							title="Error"
							subtitle={grading.error}
							lowContrast
							style={{ marginBottom: "1rem" }}
						/>
					)}

					<div
						style={{
							marginBottom: "1.25rem",
							padding: "0.75rem 1rem",
							background: "var(--cds-layer-02)",
							borderLeft: "3px solid var(--cds-border-interactive)",
						}}
					>
						<p
							style={{
								fontWeight: 600,
								marginBottom: "0.5rem",
								fontSize: "0.875rem",
							}}
						>
							Student Submission
						</p>
						{grading.loadingDetail ? (
							<SkeletonText paragraph lineCount={2} />
						) : grading.detail?.submissionText || grading.detail?.fileUrl ? (
							<>
								{grading.detail.submissionText && (
									<p
										style={{
											fontSize: "0.875rem",
											whiteSpace: "pre-wrap",
											margin: 0,
										}}
									>
										{grading.detail.submissionText}
									</p>
								)}
								{grading.detail.fileUrl && (
									<a
										href={grading.detail.fileUrl}
										target="_blank"
										rel="noopener noreferrer"
										style={{
											display: "inline-block",
											marginTop: grading.detail.submissionText ? "0.5rem" : 0,
											fontSize: "0.875rem",
										}}
									>
										View submitted file
									</a>
								)}
							</>
						) : (
							<p
								style={{
									fontSize: "0.875rem",
									color: "var(--cds-text-secondary)",
									margin: 0,
								}}
							>
								No submission content yet.
							</p>
						)}
					</div>

					{criteria.length === 0 ? (
						<p>This assignment has no grading criteria defined.</p>
					) : (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "0.75rem",
							}}
						>
							{criteria.map((c, i) => (
								<Checkbox
									key={i}
									id={`criteria-${i}`}
									labelText={`${c.label} — ${c.points} pts${c.description ? `: ${c.description}` : ""}`}
									checked={grading.checked[i]}
									onChange={() => toggleCriteria(i)}
									disabled={grading.submitting}
								/>
							))}
						</div>
					)}

					<p style={{ marginTop: "1rem", fontWeight: 600 }}>
						Computed grade: {computedGrade} /{" "}
						{criteria.reduce((s, c) => s + c.points, 0)} pts
						{assignment?.minPoints !== undefined && (
							<span
								style={{
									marginLeft: "0.5rem",
									color:
										computedGrade >= assignment.minPoints ? "green" : "red",
								}}
							>
								({computedGrade >= assignment.minPoints ? "Pass" : "Fail"} — min{" "}
								{assignment.minPoints} pts)
							</span>
						)}
					</p>

					<TextArea
						id="grading-feedback"
						labelText="Feedback (optional)"
						placeholder="Leave a comment for the student…"
						value={grading.feedback}
						onChange={(e) =>
							setGrading((prev) =>
								prev ? { ...prev, feedback: e.target.value } : prev,
							)
						}
						disabled={grading.submitting}
						rows={3}
						style={{ marginTop: "1rem" }}
					/>
				</Modal>
			)}
		</div>
	);
}
