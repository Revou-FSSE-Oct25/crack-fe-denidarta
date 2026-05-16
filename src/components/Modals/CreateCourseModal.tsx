"use client";

import {
	Modal,
	TextInput,
	TextArea,
	Select,
	SelectItem,
	DatePicker,
	DatePickerInput,
	Form,
	Stack,
	InlineNotification,
	Loading,
} from "@carbon/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/lib/api-client";
import { fetchAdminsAndInstructors } from "@/services/users.service";
import { fetchAllPrograms } from "@/services/programs.service";
import { courseSchema, type CourseFormValues } from "@/schemas/course.schema";

interface CreateCourseModalProps {
	open: boolean;
	onRequestClose: () => void;
	onSuccess: () => void;
}

export default function CreateCourseModal({
	open,
	onRequestClose,
	onSuccess,
}: CreateCourseModalProps) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { data: instructors = [], isLoading: instructorsLoading } = useQuery({
		queryKey: ["users", "admins-instructors"],
		queryFn: fetchAdminsAndInstructors,
	});
	const { data: programs = [], isLoading: programsLoading } = useQuery({
		queryKey: ["programs-all"],
		queryFn: fetchAllPrograms,
	});
	const loadingData = instructorsLoading || programsLoading;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CourseFormValues>({
		resolver: zodResolver(courseSchema),
		defaultValues: {
			name: "",
			description: "",
			instructorId: "",
			programId: "",
			status: "draft",
			startedAt: "",
			endedAt: "",
		},
	});

	const handleClose = () => {
		reset();
		setError(null);
		onRequestClose();
	};

	const onSubmit = async (values: CourseFormValues) => {
		setError(null);
		setSubmitting(true);
		try {
			const res = await apiFetch("/courses", {
				method: "POST",
				body: JSON.stringify({
					name: values.name,
					description: values.description || undefined,
					instructorId: values.instructorId,
					programId: values.programId,
					status: values.status,
					startedAt: values.startedAt,
					endedAt: values.endedAt,
				}),
			});
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as {
					message?: string;
				};
				throw new Error(body?.message ?? `Error ${res.status}`);
			}
			onSuccess();
			handleClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			aria-label="Create course modal"
			modalHeading="Create Course"
			open={open}
			primaryButtonText={submitting ? "Creating..." : "Create Course"}
			primaryButtonDisabled={submitting || loadingData}
			secondaryButtonText="Cancel"
			onRequestClose={handleClose}
			onRequestSubmit={handleSubmit(onSubmit)}
			onSecondarySubmit={handleClose}
		>
			{loadingData ? (
				<Loading withOverlay={false} small />
			) : (
				<Form>
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

						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<TextInput
									{...field}
									id="course-name"
									labelText="Course Name"
									placeholder="e.g. Introduction to Programming"
									invalid={!!errors.name}
									invalidText={errors.name?.message}
								/>
							)}
						/>

						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<TextArea
									{...field}
									id="course-description"
									labelText="Description (optional)"
									placeholder="Brief description of the course"
									rows={3}
								/>
							)}
						/>

						<Controller
							name="instructorId"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									id="course-instructor"
									labelText="Instructor"
									invalid={!!errors.instructorId}
									invalidText={errors.instructorId?.message}
								>
									<SelectItem text="Choose an instructor" value="" />
									{instructors.map((inst) => (
										<SelectItem
											key={inst.id}
											text={inst.profile?.fullName ?? inst.username}
											value={inst.id}
										/>
									))}
								</Select>
							)}
						/>

						<Controller
							name="programId"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									id="course-program"
									labelText="Program"
									invalid={!!errors.programId}
									invalidText={errors.programId?.message}
								>
									<SelectItem text="Choose a program" value="" />
									{programs.map((prog) => (
										<SelectItem
											key={prog.programId}
											text={prog.name}
											value={prog.programId}
										/>
									))}
								</Select>
							)}
						/>

						<Controller
							name="status"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									id="course-status"
									labelText="Status"
									invalid={!!errors.status}
									invalidText={errors.status?.message}
								>
									<SelectItem text="Draft" value="draft" />
									<SelectItem text="Active" value="active" />
									<SelectItem text="Archived" value="archived" />
									<SelectItem text="Completed" value="completed" />
								</Select>
							)}
						/>

						<Controller
							name="startedAt"
							control={control}
							render={({ field }) => (
								<DatePicker
									datePickerType="single"
									onChange={(dates) => {
										if (dates[0])
											field.onChange(
												new Date(
													Date.UTC(
														dates[0].getFullYear(),
														dates[0].getMonth(),
														dates[0].getDate(),
													),
												).toISOString(),
											);
										else field.onChange("");
									}}
								>
									<DatePickerInput
										id="course-startedAt"
										placeholder="mm/dd/yyyy"
										labelText="Start Date"
										invalid={!!errors.startedAt}
										invalidText={errors.startedAt?.message}
									/>
								</DatePicker>
							)}
						/>

						<Controller
							name="endedAt"
							control={control}
							render={({ field }) => (
								<DatePicker
									datePickerType="single"
									onChange={(dates) => {
										if (dates[0])
											field.onChange(
												new Date(
													Date.UTC(
														dates[0].getFullYear(),
														dates[0].getMonth(),
														dates[0].getDate(),
													),
												).toISOString(),
											);
										else field.onChange("");
									}}
								>
									<DatePickerInput
										id="course-endedAt"
										placeholder="mm/dd/yyyy"
										labelText="End Date"
										invalid={!!errors.endedAt}
										invalidText={errors.endedAt?.message}
									/>
								</DatePicker>
							)}
						/>
					</Stack>
				</Form>
			)}
		</Modal>
	);
}
