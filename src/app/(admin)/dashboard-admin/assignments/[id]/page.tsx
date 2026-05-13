"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Button,
	DataTable,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Tag,
	DataTableSkeleton,
	InlineNotification,
	SkeletonText,
} from "@carbon/react";
import { ArrowLeft } from "@carbon/icons-react";
import { apiFetch } from "@/lib/api-client";
import { Assignment, AssignmentSubmission } from "@/types/index.type";
import { statusTagType } from "@/utils/tag-type";

class HttpError extends Error {
	constructor(public status: number, msg: string) {
		super(msg);
		this.name = "HttpError";
	}
}

const submissionHeaders = [
	{ key: "userId", header: "Student ID" },
	{ key: "status", header: "Status" },
	{ key: "grade", header: "Grade" },
	{ key: "passed", header: "Passed" },
	{ key: "submittedAt", header: "Submitted At" },
	{ key: "feedback", header: "Feedback" },
];

const DATE_LOCALE = "id-ID";

function submissionStatusTagType(status: string) {
	const map: Record<string, "blue" | "teal" | "green" | "gray"> = {
		draft: "gray",
		submitted: "blue",
		graded: "teal",
		returned: "green",
	};
	return map[status] ?? "gray";
}

export default function AssignmentDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();

	const [assignment, setAssignment] = useState<Assignment | null>(null);
	const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
	const [loadingAssignment, setLoadingAssignment] = useState(true);
	const [loadingSubmissions, setLoadingSubmissions] = useState(true);
	const [assignmentError, setAssignmentError] = useState<string | null>(null);
	const [submissionsError, setSubmissionsError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;
		let mounted = true;
		const controller = new AbortController();

		async function fetchAssignment() {
			try {
				const res = await apiFetch(`/assignments/${id}`, {
					signal: controller.signal,
				});
				if (!res.ok)
					throw new HttpError(res.status, `Failed to fetch assignment (${res.status})`);
				const { data } = (await res.json()) as { data: Assignment };
				if (mounted) setAssignment(data);
			} catch (err) {
				if (!mounted || (err instanceof DOMException && err.name === "AbortError")) return;
				setAssignmentError(err instanceof Error ? err.message : "Unexpected error");
			} finally {
				if (mounted) setLoadingAssignment(false);
			}
		}

		void fetchAssignment();
		return () => {
			mounted = false;
			controller.abort();
		};
	}, [id]);

	useEffect(() => {
		if (!id) return;
		let mounted = true;
		const controller = new AbortController();

		async function fetchSubmissions() {
			try {
				const res = await apiFetch(`/submissions?assignmentId=${id}`, {
					signal: controller.signal,
				});
				if (!res.ok)
					throw new HttpError(res.status, `Failed to fetch submissions (${res.status})`);
				const json = (await res.json()) as { data: AssignmentSubmission[] | { items: AssignmentSubmission[] } };
				const list = Array.isArray(json.data)
					? json.data
					: Array.isArray((json.data as { items: AssignmentSubmission[] }).items)
					? (json.data as { items: AssignmentSubmission[] }).items
					: [];
				if (mounted) setSubmissions(list);
			} catch (err) {
				if (!mounted || (err instanceof DOMException && err.name === "AbortError")) return;
				setSubmissionsError(err instanceof Error ? err.message : "Unexpected error");
			} finally {
				if (mounted) setLoadingSubmissions(false);
			}
		}

		void fetchSubmissions();
		return () => {
			mounted = false;
			controller.abort();
		};
	}, [id]);

	const submissionRows = submissions.map((s) => ({
		id: String(s.id),
		userId: String(s.user_id),
		status: s.status,
		grade: s.grade !== null ? String(s.grade) : "-",
		passed: s.passed ? "Yes" : "No",
		submittedAt: s.submitted_at
			? new Date(s.submitted_at).toLocaleDateString(DATE_LOCALE)
			: "-",
		feedback: s.feedback ?? "-",
	}));

	return (
		<div style={{ padding: "1.5rem" }}>
			<Button
				kind="ghost"
				size="sm"
				renderIcon={ArrowLeft}
				onClick={() => router.push("/dashboard-admin/assignments")}
				style={{ marginBottom: "1rem" }}
			>
				Back
			</Button>

			{assignmentError && (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={assignmentError}
					lowContrast
					style={{ marginBottom: "1rem" }}
				/>
			)}

			{loadingAssignment ? (
				<SkeletonText paragraph lineCount={4} style={{ maxWidth: "480px", marginBottom: "2rem" }} />
			) : assignment ? (
				<div style={{ marginBottom: "2rem" }}>
					<h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>
						{assignment.title}
					</h1>
					<p style={{ color: "#6f6f6f", marginBottom: "0.75rem" }}>
						{assignment.course?.name}
					</p>
					{assignment.description && (
						<p style={{ marginBottom: "0.75rem" }}>{assignment.description}</p>
					)}
					<div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.875rem" }}>
						<span>
							<strong>Status: </strong>
							<Tag type={statusTagType(assignment.status)} size="sm">
								{assignment.status}
							</Tag>
						</span>
						<span>
							<strong>Due Date:</strong>{" "}
							{new Date(assignment.dueDate).toLocaleDateString(DATE_LOCALE)}
						</span>
						<span>
							<strong>Max Points:</strong> {assignment.maxPoints}
						</span>
					</div>
				</div>
			) : null}

			<h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
				Submissions
			</h2>

			{submissionsError && (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={submissionsError}
					lowContrast
					style={{ marginBottom: "1rem" }}
				/>
			)}

			{loadingSubmissions ? (
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
											<TableHeader {...getHeaderProps({ header })} key={header.key}>
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
										rows.map((row) => (
											<TableRow {...getRowProps({ row })} key={row.id}>
												{row.cells.map((cell) => {
													if (cell.info.header === "status") {
														return (
															<TableCell key={cell.id}>
																<Tag
																	type={submissionStatusTagType(String(cell.value))}
																	size="sm"
																>
																	{String(cell.value)}
																</Tag>
															</TableCell>
														);
													}
													if (cell.info.header === "passed") {
														return (
															<TableCell key={cell.id}>
																<Tag
																	type={cell.value === "Yes" ? "green" : "red"}
																	size="sm"
																>
																	{String(cell.value)}
																</Tag>
															</TableCell>
														);
													}
													return (
														<TableCell key={cell.id}>{cell.value}</TableCell>
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
		</div>
	);
}
