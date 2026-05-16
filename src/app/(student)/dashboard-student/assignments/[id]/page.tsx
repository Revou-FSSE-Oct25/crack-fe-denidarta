"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
	Button,
	InlineNotification,
	Loading,
	Modal,
	Tag,
	TextArea,
	TextInput,
} from "@carbon/react";
import { apiFetch } from "@/lib/api-client";
import { getCurrentUserId } from "@/utils/auth";
import { Assignment, AssignmentSubmission } from "@/types/index.type";
import styles from "./page.module.scss";

export default function AssignmentDetailPage() {
	const { id } = useParams<{ id: string }>();
	const [assignment, setAssignment] = useState<Assignment | null>(null);
	const [submission, setSubmission] = useState<AssignmentSubmission | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [submissionText, setSubmissionText] = useState("");
	const [fileUrl, setFileUrl] = useState("");
	const [saving, setSaving] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	useEffect(() => {
		let mounted = true;
		async function fetchData() {
			try {
				const res = await apiFetch(`/assignments/${id}`);
				if (!res.ok)
					throw new Error(`Failed to load assignment (${res.status})`);
				const { data: a } = (await res.json()) as { data: Assignment };
				if (!mounted) return;
				setAssignment(a);
				const sub = a.submissions?.[0] ?? null;
				if (sub) {
					setSubmission(sub as unknown as AssignmentSubmission);
					setSubmissionText(
						(sub as { submissionText?: string }).submissionText ?? "",
					);
					setFileUrl((sub as { fileUrl?: string }).fileUrl ?? "");
				}
			} catch (err) {
				if (mounted)
					setFetchError(err instanceof Error ? err.message : "Failed to load");
			} finally {
				if (mounted) setLoading(false);
			}
		}
		void fetchData();
		return () => {
			mounted = false;
		};
	}, [id]);

	const isPastDue = assignment
		? new Date() > new Date(assignment.dueDate)
		: false;
	const canSubmit = assignment?.status === "published" && !isPastDue;
	const submissionStatus = submission?.status ?? "notSubmitted";
	const isDraftOrNew = submissionStatus === "notSubmitted" || !submission;

	async function saveDraft(): Promise<AssignmentSubmission | null> {
		setSaving(true);
		setSubmitError(null);
		try {
			if (submission?.id) {
				const res = await apiFetch(`/submissions/${submission.id}`, {
					method: "PATCH",
					body: JSON.stringify({ submissionText, fileUrl }),
				});
				if (!res.ok) throw new Error("Failed to update draft");
				const { data } = (await res.json()) as { data: AssignmentSubmission };
				setSubmission(data);
				return data;
			} else {
				const studentId = getCurrentUserId();
				if (!studentId) throw new Error("Not authenticated");
				const res = await apiFetch("/submissions", {
					method: "POST",
					body: JSON.stringify({
						assignmentId: id,
						studentId,
						submissionText,
						fileUrl,
					}),
				});
				if (res.status === 409)
					throw new Error("You have already submitted this assignment");
				if (!res.ok) throw new Error("Failed to create draft");
				const { data } = (await res.json()) as { data: AssignmentSubmission };
				setSubmission(data);
				return data;
			}
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : "Save failed");
			return null;
		} finally {
			setSaving(false);
		}
	}

	async function finalizeSubmission() {
		setConfirmOpen(false);
		setSaving(true);
		setSubmitError(null);
		try {
			let sub = submission;
			if (!sub?.id) {
				sub = await saveDraft();
			}
			if (!sub?.id) throw new Error("Failed to save draft before submitting");
			const res = await apiFetch(`/submissions/${sub.id}/submit`, {
				method: "PATCH",
				body: JSON.stringify({}),
			});
			if (!res.ok) throw new Error("Failed to submit");
			const { data } = (await res.json()) as { data: AssignmentSubmission };
			setSubmission(data);
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : "Submit failed");
		} finally {
			setSaving(false);
		}
	}

	if (loading)
		return <Loading withOverlay={false} description="Loading assignment..." />;
	if (fetchError)
		return (
			<InlineNotification
				kind="error"
				title="Error"
				subtitle={fetchError}
				lowContrast
			/>
		);
	if (!assignment) return null;

	return (
		<div className={styles.container}>
			{/* Assignment Info */}
			<section className={styles.section}>
				<h1 className={styles.title}>{assignment.title}</h1>
				<p className={styles.meta}>
					Course: <strong>{assignment.course?.name ?? "—"}</strong>{" "}
					&nbsp;·&nbsp; Due:{" "}
					<strong>
						{new Date(assignment.dueDate).toLocaleDateString("id-ID")}
					</strong>{" "}
					&nbsp;·&nbsp;
					<Tag
						type={assignment.status === "published" ? "green" : "gray"}
						size="sm"
					>
						{assignment.status}
					</Tag>
				</p>
				{assignment.description && (
					<p className={styles.description}>{assignment.description}</p>
				)}

				{assignment.gradingCriteria &&
					assignment.gradingCriteria.length > 0 && (
						<div className={styles.criteria}>
							<h3>Grading Criteria</h3>
							<table className={styles.criteriaTable}>
								<thead>
									<tr>
										<th>Criterion</th>
										<th>Points</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{assignment.gradingCriteria.map((c, i) => (
										<tr key={i}>
											<td>{c.label}</td>
											<td>{c.points}</td>
											<td>{c.description}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
			</section>

			{/* Submission Panel — only when assignment is open and submission is not finalized */}
			{canSubmit && isDraftOrNew && (
				<section className={styles.section}>
					<h2>Your Submission</h2>
					{submitError && (
						<InlineNotification
							kind="error"
							title="Error"
							subtitle={submitError}
							lowContrast
							style={{ marginBottom: "1rem" }}
						/>
					)}
					<TextArea
						id="submissionText"
						labelText="Submission Text"
						value={submissionText}
						onChange={(e) => setSubmissionText(e.target.value)}
						rows={6}
						style={{ marginBottom: "1rem" }}
					/>
					<TextInput
						id="fileUrl"
						labelText="File URL (optional)"
						value={fileUrl}
						onChange={(e) => setFileUrl(e.target.value)}
						placeholder="https://..."
						style={{ marginBottom: "1.5rem" }}
					/>
					<div className={styles.actions}>
						<Button kind="secondary" onClick={saveDraft} disabled={saving}>
							{saving
								? "Saving..."
								: submission?.id
									? "Update Draft"
									: "Save Draft"}
						</Button>
						<Button
							kind="primary"
							onClick={() => setConfirmOpen(true)}
							disabled={saving}
						>
							{submission?.id ? "Submit Final" : "Submit"}
						</Button>
					</div>
				</section>
			)}

			{/* Past due with no submission */}
			{!canSubmit && !submission && (
				<section className={styles.section}>
					<InlineNotification
						kind="warning"
						title="Submission closed"
						subtitle="The due date has passed or this assignment is closed."
						lowContrast
					/>
				</section>
			)}

			{/* Read-only submitted work */}
			{submission &&
				(submissionStatus === "submitted" || submissionStatus === "graded") && (
					<section className={styles.section}>
						<h2>Submitted Work</h2>
						<p>
							<strong>Text:</strong> {submission.submissionText ?? "—"}
						</p>
						{submission.fileUrl && (
							<p>
								<strong>File:</strong>{" "}
								<a
									href={submission.fileUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{submission.fileUrl}
								</a>
							</p>
						)}
					</section>
				)}

			{/* Grade Panel */}
			{submission && submissionStatus === "graded" && (
				<section className={styles.section}>
					<h2>Grade</h2>
					<p>
						Score: <strong>{submission.grade ?? "—"}</strong> &nbsp;·&nbsp;
						<Tag type={submission.passed ? "green" : "red"} size="sm">
							{submission.passed ? "Passed" : "Failed"}
						</Tag>
					</p>
					{submission.feedback && (
						<p>
							<strong>Feedback:</strong> {submission.feedback}
						</p>
					)}
				</section>
			)}

			<Modal
				open={confirmOpen}
				modalHeading="Submit Assignment"
				primaryButtonText="Submit"
				secondaryButtonText="Cancel"
				onRequestClose={() => setConfirmOpen(false)}
				onRequestSubmit={finalizeSubmission}
				danger
			>
				<p>Once submitted you cannot edit your work. Are you sure?</p>
			</Modal>
		</div>
	);
}
