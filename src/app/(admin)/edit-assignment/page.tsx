"use client";

import { useEffect, useState, Suspense } from "react";
import {
	Button,
	Form,
	TextInput,
	TextArea,
	Select,
	SelectItem,
	DatePicker,
	DatePickerInput,
	NumberInput,
	Heading,
	Stack,
	InlineNotification,
	Loading,
	Breadcrumb,
	BreadcrumbItem,
	IconButton,
	Section,
} from "@carbon/react";
import { Save, Add, TrashCan, CatalogPublish } from "@carbon/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { fetchAllCourses } from "@/services/courses.service";
import { Assignment } from "@/types/assignment";
import AppShell from "@/components/AppShell";
import { assignmentSchema, type AssignmentFormValues } from "@/schemas/assignment.schema";
import styles from "./edit-assignment.module.scss";

export default function EditAssignmentPage() {
  return (
    <Suspense>
      <EditAssignmentPageInner />
    </Suspense>
  );
}

function EditAssignmentPageInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const assignmentId = searchParams.get("id");

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const { data: courses = [] } = useQuery({
		queryKey: ["courses-all"],
		queryFn: fetchAllCourses,
	});

	const {
		control,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<AssignmentFormValues>({
		resolver: zodResolver(assignmentSchema),
		defaultValues: {
			courseId: "",
			title: "",
			description: "",
			dueDate: "",
			minPoints: "" as unknown as number,
			status: "draft",
			gradingCriteria: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "gradingCriteria",
	});

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!assignmentId) {
			setError("No assignment ID provided");
			setLoading(false);
			return;
		}
		apiFetch(`/assignments/${assignmentId}`)
			.then(async (res) => {
				if (!res.ok) throw new Error("Failed to fetch assignment details");
				const { data: assignmentData } = (await res.json()) as { data: Assignment };
				reset({
					courseId: assignmentData.courseId,
					title: assignmentData.title,
					description: assignmentData.description || "",
					dueDate: new Date(assignmentData.dueDate).toDateString(),
					minPoints: Number(assignmentData.minPoints),
					status: assignmentData.status,
					gradingCriteria: assignmentData.gradingCriteria || [],
				});
			})
			.catch((err) => setError((err as Error).message))
			.finally(() => setLoading(false));
	}, [assignmentId, reset]);

	const onSubmit = async (data: AssignmentFormValues) => {
		setError(null);
		setSubmitting(true);

		try {
			const res = await apiFetch(`/assignments/${assignmentId}`, {
				method: "PATCH",
				body: JSON.stringify({
					...data,
					dueDate: new Date(data.dueDate).toISOString(),
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Failed to update assignment");
			}

			setSuccess(true);
			setTimeout(() => {
				router.push("/dashboard-admin/assignments");
			}, 1500);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setSubmitting(false);
		}
	};

	const onActionSubmit = (status: string) => {
		setValue("status", status);
		handleSubmit(onSubmit)();
	};

	if (loading) {
		return (
			<AppShell role="admin">
				<div className={styles.loading}>
					<Loading withOverlay={false} />
				</div>
			</AppShell>
		);
	}

	const content = (
		<div className={styles.container}>
			<Breadcrumb className={styles.breadcrumb}>
				<BreadcrumbItem href="/dashboard-admin">Dashboard</BreadcrumbItem>
				<BreadcrumbItem href="/dashboard-admin/assignments">
					Assignments
				</BreadcrumbItem>
				<BreadcrumbItem isCurrentPage>Edit Assignment</BreadcrumbItem>
			</Breadcrumb>

			<Section level={2} className={styles.header}>
				<Heading className={styles.title}>Edit Assignment</Heading>
				<p className={styles.subtitle}>
					Update the task requirements and grading criteria.
				</p>
			</Section>

			{error && (
				<InlineNotification
					kind="error"
					title="Error"
					subtitle={error}
					lowContrast
					className={styles.notification}
					onClose={() => setError(null)}
				/>
			)}

			{success && (
				<InlineNotification
					kind="success"
					title="Success"
					subtitle="Assignment updated successfully! Redirecting..."
					lowContrast
					className={styles.notification}
				/>
			)}

			<div className={styles.formContainer}>
				<Form onSubmit={handleSubmit(onSubmit)}>
					<Stack gap={7}>
						<Controller
							name="courseId"
							control={control}
								render={({ field }) => (
								<Select
									{...field}
									id="courseId"
									labelText="Course"
									helperText="Select the course this assignment belongs to"
									invalid={!!errors.courseId}
									invalidText={errors.courseId?.message}
									required
								>
									<SelectItem text="Choose a course" value="" />
									{courses.map((course) => (
										<SelectItem
											key={course.id}
											text={course.name}
											value={course.id}
										/>
									))}
								</Select>
							)}
						/>

						<Controller
							name="title"
							control={control}
								render={({ field }) => (
								<TextInput
									{...field}
									id="title"
									labelText="Assignment Title"
									placeholder="e.g. Weekly Quiz: Advanced Typescript"
									invalid={!!errors.title}
									invalidText={errors.title?.message}
									required
								/>
							)}
						/>

						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<TextArea
									{...field}
									id="description"
									labelText="Description"
									placeholder="Provide instructions, external links, or resources..."
									rows={6}
								/>
							)}
						/>

						<Section level={4} className={styles.criteriaSection}>
							<div className={styles.criteriaHeader}>
								<Heading>Grading Criteria</Heading>
								<Button
									kind="ghost"
									size="sm"
									renderIcon={Add}
									onClick={() =>
										append({
											label: "",
											points: "" as unknown as number,
											description: "",
										})
									}
								>
									Add Criteria
								</Button>
							</div>

							{fields.map((field, index) => (
								<div key={field.id} className={styles.criteriaItem}>
									<div className={styles.criteriaRow}>
										<div style={{ flex: 2 }}>
											<Controller
												name={`gradingCriteria.${index}.label`}
												control={control}
													render={({ field: inputField }) => (
													<TextInput
														{...inputField}
														id={`criteria-label-${index}`}
														labelText="Criteria Name"
														placeholder="e.g. Code Quality"
														invalid={!!errors.gradingCriteria?.[index]?.label}
														invalidText={
															errors.gradingCriteria?.[index]?.label?.message
														}
													/>
												)}
											/>
										</div>
										<div style={{ flex: 1 }}>
											<Controller
												name={`gradingCriteria.${index}.points`}
												control={control}
													render={({ field: inputField }) => (
													<NumberInput
														id={`criteria-points-${index}`}
														label="Points"
														hideSteppers
														allowEmpty
														value={inputField.value ?? ""}
														onChange={(_, { value }) =>
															inputField.onChange(
																value === "" ? "" : Number(value),
															)
														}
														min={0}
														invalid={!!errors.gradingCriteria?.[index]?.points}
														invalidText={
															errors.gradingCriteria?.[index]?.points?.message
														}
													/>
												)}
											/>
										</div>
										<IconButton
											kind="ghost"
											label="Remove criteria"
											align="bottom"
											onClick={() => remove(index)}
											className={styles.removeBtn}
										>
											<TrashCan />
										</IconButton>
									</div>
									<Controller
										name={`gradingCriteria.${index}.description`}
										control={control}
										render={({ field: inputField }) => (
											<TextInput
												{...inputField}
												id={`criteria-desc-${index}`}
												labelText="Description (optional)"
												placeholder="Details about this criteria"
											/>
										)}
									/>
								</div>
							))}
							{fields.length === 0 && (
								<p className={styles.emptyCriteria}>
									No grading criteria added. Click `&quot;` Add Criteria
									`&quot;` to create one.
								</p>
							)}
						</Section>

						<div className={styles.row}>
							<div className={styles.col}>
								<Controller
									name="dueDate"
									control={control}
										render={({ field }) => (
										<DatePicker
											datePickerType="single"
											value={field.value}
											onClose={() => field.onBlur()}
											onChange={(dates) => {
												if (dates && dates[0]) {
													field.onChange(dates[0].toDateString());
												}
											}}
										>
											<DatePickerInput
												placeholder="mm/dd/yyyy"
												labelText="Due Date"
												id="dueDate"
												invalid={!!errors.dueDate}
												invalidText={errors.dueDate?.message}
											/>
										</DatePicker>
									)}
								/>
							</div>

							<div className={styles.col}>
								<Controller
									name="minPoints"
									control={control}
									render={({ field }) => (
										<NumberInput
											id="minPoints"
											label="Minimum Points"
											helperText="Minimum score required to pass"
											hideSteppers
											allowEmpty
											value={field.value ?? ""}
											onChange={(_, { value }) =>
												field.onChange(value === "" ? "" : Number(value))
											}
											min={0}
											max={100}
										/>
									)}
								/>
							</div>
						</div>

						<div className={styles.actions}>
							<Button
								id="btn-cancel"
								kind="secondary"
								onClick={() => router.back()}
								disabled={submitting}
							>
								Cancel
							</Button>
							<Button
								id="btn-draft"
								type="button"
								kind="secondary"
								renderIcon={Save}
								disabled={submitting}
								onClick={() => onActionSubmit("draft")}
							>
								Save as Draft
							</Button>
							<Button
								id="btn-publish"
								type="button"
								renderIcon={CatalogPublish}
								disabled={submitting}
								onClick={() => onActionSubmit("published")}
							>
								{submitting ? "Updating..." : "Update & Publish"}
							</Button>
						</div>
					</Stack>
				</Form>
			</div>
		</div>
	);

	return <AppShell role="admin">{content}</AppShell>;
}
