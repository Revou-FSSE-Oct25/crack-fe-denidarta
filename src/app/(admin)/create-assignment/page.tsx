"use client";

import { useEffect, useState } from "react";
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
} from "@carbon/react";
import { Save, Close } from "@carbon/icons-react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { apiFetch } from "@/lib/api-client";
import { Course } from "@/types/course";
import DashboardShell from "@/components/DashboardShell";
import styles from "./create-assignment.module.scss";

interface AssignmentFormValues {
	courseId: string;
	title: string;
	description: string;
	dueDate: string;
	minPoints: number;
	status: string;
}

export default function CreateAssignmentPage() {
	const router = useRouter();
	const [courses, setCourses] = useState<Course[]>([]);
	const [loadingCourses, setLoadingCourses] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<AssignmentFormValues>({
		defaultValues: {
			courseId: "",
			title: "",
			description: "",
			dueDate: "",
			minPoints: 0,
			status: "draft",
		},
	});

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const res = await apiFetch("/courses?limit=100");
				if (!res.ok) throw new Error("Failed to fetch courses");
				const { data } = await res.json();
				setCourses(data.items || []);
			} catch (err) {
				console.error(err);
				setError("Could not load courses. Please try again.");
			} finally {
				setLoadingCourses(false);
			}
		};

		fetchCourses();
	}, []);

	const onSubmit = async (data: AssignmentFormValues) => {
		setError(null);
		setSubmitting(true);

		try {
			const res = await apiFetch("/assignments", {
				method: "POST",
				body: JSON.stringify({
					...data,
					// Ensure dueDate is ISO string
					dueDate: new Date(data.dueDate).toISOString(),
					submitted: 0,
					toSubmit: 0,
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Failed to create assignment");
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

	const content = (
		<div className={styles.container}>
			<Breadcrumb className={styles.breadcrumb}>
				<BreadcrumbItem href="/dashboard-admin">Dashboard</BreadcrumbItem>
				<BreadcrumbItem href="/dashboard-admin/assignments">
					Assignments
				</BreadcrumbItem>
				<BreadcrumbItem isCurrentPage>Create Assignment</BreadcrumbItem>
			</Breadcrumb>

			<div className={styles.header}>
				<Heading className={styles.title}>Create New Assignment</Heading>
				<p className={styles.subtitle}>
					Define the task and requirements for students in a specific course.
				</p>
			</div>

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
					subtitle="Assignment created successfully! Redirecting..."
					lowContrast
					className={styles.notification}
				/>
			)}

			<div className={styles.formContainer}>
				{loadingCourses ? (
					<div className={styles.loading}>
						<Loading withOverlay={false} />
					</div>
				) : (
					<Form onSubmit={handleSubmit(onSubmit)}>
						<Stack gap={7}>
							<Controller
								name="courseId"
								control={control}
								rules={{ required: "Please select a course" }}
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
								rules={{
									required: "Title is required",
									maxLength: { value: 255, message: "Title too long" },
								}}
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

							<div style={{ display: "flex", gap: "1rem" }}>
								<div style={{ flex: 1 }}>
									<Controller
										name="dueDate"
										control={control}
										rules={{ required: "Due date is required" }}
										render={({ field }) => (
											<DatePicker
												datePickerType="single"
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

								<div style={{ flex: 1 }}>
									<Controller
										name="minPoints"
										control={control}
										render={({ field }) => (
											<NumberInput
												id="minPoints"
												label="Minimum Points"
												helperText="Minimum score required to pass"
												hideSteppers
												value={field.value}
												onChange={(_, { value }) =>
													field.onChange(Number(value))
												}
												min={0}
												max={100}
											/>
										)}
									/>
								</div>
							</div>

							<Controller
								name="status"
								control={control}
								render={({ field }) => (
									<Select {...field} id="status" labelText="Publish Status">
										<SelectItem
											text="Draft (Hidden from students)"
											value="draft"
										/>
										<SelectItem
											text="Published (Visible and active)"
											value="published"
										/>
										<SelectItem
											text="Closed (No longer accepting submissions)"
											value="closed"
										/>
									</Select>
								)}
							/>

							<div className={styles.actions}>
								<Button
									kind="secondary"
									renderIcon={Close}
									onClick={() => router.back()}
									disabled={submitting}
								>
									Cancel
								</Button>
								<Button type="submit" renderIcon={Save} disabled={submitting}>
									{submitting ? "Creating..." : "Create Assignment"}
								</Button>
							</div>
						</Stack>
					</Form>
				)}
			</div>
		</div>
	);

	return <DashboardShell>{content}</DashboardShell>;
}
