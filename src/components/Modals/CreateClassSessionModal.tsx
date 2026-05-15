"use client";

import {
	Modal,
	TextInput,
	Select,
	SelectItem,
	DatePicker,
	DatePickerInput,
	TimePicker,
	InlineNotification,
	Loading,
} from "@carbon/react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { apiFetch } from "@/lib/api-client";
import type { Course } from "@/types/course";

interface CreateClassSessionModalProps {
	open: boolean;
	onRequestClose: () => void;
	onSuccess: () => void;
}

interface FormValues {
	courseId: string;
	title: string;
	sessionDate: string;
	startTime: string;
	endTime: string;
	location: string;
	meetingUrl: string;
}

function toTimeISO(hhmm: string): string {
	return `1970-01-01T${hhmm}:00.000Z`;
}

export default function CreateClassSessionModal({
	open,
	onRequestClose,
	onSuccess,
}: CreateClassSessionModalProps) {
	const [courses, setCourses] = useState<Course[]>([]);
	const [loadingCourses, setLoadingCourses] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		defaultValues: {
			courseId: "",
			title: "",
			sessionDate: "",
			startTime: "",
			endTime: "",
			location: "",
			meetingUrl: "",
		},
	});

	useEffect(() => {
		if (!open) return;
		setLoadingCourses(true);
		apiFetch("/courses?limit=100")
			.then((res) => res.json())
			.then(({ data }: { data: { items: Course[] } }) =>
				setCourses(data?.items ?? []),
			)
			.catch(() => setError("Could not load courses. Please try again."))
			.finally(() => setLoadingCourses(false));
	}, [open]);

	const handleClose = () => {
		reset();
		setError(null);
		onRequestClose();
	};

	const onSubmit = async (values: FormValues) => {
		setError(null);
		setSubmitting(true);
		try {
			const res = await apiFetch("/class-sessions", {
				method: "POST",
				body: JSON.stringify({
					courseId: values.courseId,
					title: values.title,
					sessionDate: values.sessionDate,
					startTime: toTimeISO(values.startTime),
					endTime: toTimeISO(values.endTime),
					location: values.location || undefined,
					meetingUrl: values.meetingUrl || undefined,
					status: "scheduled",
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
			aria-label="Create class session modal"
			modalHeading="Create Class Session"
			open={open}
			primaryButtonText={submitting ? "Creating..." : "Create"}
			primaryButtonDisabled={submitting || loadingCourses}
			secondaryButtonText="Cancel"
			onRequestClose={handleClose}
			onRequestSubmit={handleSubmit(onSubmit)}
			onSecondarySubmit={handleClose}
		>
			{loadingCourses ? (
				<Loading withOverlay={false} small />
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
					{error !== null && (
						<InlineNotification
							kind="error"
							title="Error"
							subtitle={error}
							lowContrast
							onClose={() => setError(null)}
						/>
					)}

					<Controller
						name="courseId"
						control={control}
						rules={{ required: "Please select a course" }}
						render={({ field }) => (
							<Select
								{...field}
								id="cs-courseId"
								labelText="Course"
								invalid={!!errors.courseId}
								invalidText={errors.courseId?.message}
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
						rules={{
							required: "Title is required",
							maxLength: { value: 255, message: "Title too long" },
						}}
						render={({ field }) => (
							<TextInput
								{...field}
								id="cs-title"
								labelText="Title"
								placeholder="e.g. Week 1 - Introduction"
								invalid={!!errors.title}
								invalidText={errors.title?.message}
							/>
						)}
					/>

					<Controller
						name="sessionDate"
						control={control}
						rules={{ required: "Session date is required" }}
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
								}}
							>
								<DatePickerInput
									id="cs-sessionDate"
									placeholder="mm/dd/yyyy"
									labelText="Session Date"
									invalid={!!errors.sessionDate}
									invalidText={errors.sessionDate?.message}
								/>
							</DatePicker>
						)}
					/>

					<div style={{ display: "flex", gap: "1rem" }}>
						<Controller
							name="startTime"
							control={control}
							rules={{ required: "Start time is required" }}
							render={({ field }) => (
								<TimePicker
									{...field}
									id="cs-startTime"
									labelText="Start Time"
									placeholder="hh:mm"
									invalid={!!errors.startTime}
									invalidText={errors.startTime?.message}
								/>
							)}
						/>

						<Controller
							name="endTime"
							control={control}
							rules={{ required: "End time is required" }}
							render={({ field }) => (
								<TimePicker
									{...field}
									id="cs-endTime"
									labelText="End Time"
									placeholder="hh:mm"
									invalid={!!errors.endTime}
									invalidText={errors.endTime?.message}
								/>
							)}
						/>
					</div>

					<Controller
						name="location"
						control={control}
						rules={{ maxLength: { value: 255, message: "Location too long" } }}
						render={({ field }) => (
							<TextInput
								{...field}
								id="cs-location"
								labelText="Location (optional)"
								placeholder="e.g. Room 101"
								invalid={!!errors.location}
								invalidText={errors.location?.message}
							/>
						)}
					/>

					<Controller
						name="meetingUrl"
						control={control}
						rules={{ maxLength: { value: 500, message: "URL too long" } }}
						render={({ field }) => (
							<TextInput
								{...field}
								id="cs-meetingUrl"
								labelText="Meeting URL (optional)"
								placeholder="https://..."
								invalid={!!errors.meetingUrl}
								invalidText={errors.meetingUrl?.message}
							/>
						)}
					/>
				</div>
			)}
		</Modal>
	);
}
