"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Button,
	TextInput,
	InlineNotification,
	FluidForm,
	FluidSelect,
	SelectItem,
	FluidDatePicker,
	FluidDatePickerInput,
} from "@carbon/react";
import { ArrowLeft, ChevronRight } from "@carbon/icons-react";
import { createProgram } from "@/services/programs.service";
import { getCurrentUser } from "@/services/profile.service";
import { fetchAdminsAndInstructors } from "@/services/users.service";
import styles from "./create-program.module.scss";

export default function CreateProgramPage() {
	const router = useRouter();
	const [programName, setProgramName] = useState("");
	const [headOfProgram, setHeadOfProgram] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [headItems, setHeadItems] = useState<Array<{ id: string; text: string }>>([]);
	const [headLoading, setHeadLoading] = useState(true);

	useEffect(() => {
		fetchAdminsAndInstructors()
			.then((users) => {
				setHeadItems(users.map((user) => ({ id: user.id, text: user.username })));
			})
			.catch((err) => console.error("Failed to load users:", err))
			.finally(() => setHeadLoading(false));
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!programName.trim()) {
			setError("Program name is required");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const user = await getCurrentUser();
			await createProgram(programName, user.id, headOfProgram || undefined);
			router.push("/dashboard/programs");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create program");
			setLoading(false);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<Button
					kind="ghost"
					size="sm"
					renderIcon={ArrowLeft}
					iconDescription="Back"
					hasIconOnly
					onClick={() => router.back()}
				/>
				<nav className={styles.breadcrumb}>
					<span style={{ color: "#525252", cursor: "pointer" }} onClick={() => router.push("/dashboard/programs")}>
						Programs
					</span>
					<ChevronRight size={14} />
					<span>Create New Program</span>
				</nav>
			</div>

			<div className={styles.content}>
				<aside className={styles.sidebar}>
					<h1 className={styles.sidebarTitle}>Create a New Program</h1>
					<p className={styles.sidebarDesc}>
						Fill in the details below to set up a new learning program. You can add courses and enroll students after creation.
					</p>
					<div className={styles.steps}>
						<div className={styles.step}>
							<div className={`${styles.stepDot} ${styles.active}`} />
							<div className={styles.stepLabel}>
								<strong>Program Details</strong>
								Name, head, and schedule
							</div>
						</div>
						<div className={styles.step}>
							<div className={styles.stepDot} />
							<div className={styles.stepLabel}>
								<strong>Add Courses</strong>
								Available after creation
							</div>
						</div>
						<div className={styles.step}>
							<div className={styles.stepDot} />
							<div className={styles.stepLabel}>
								<strong>Enroll Students</strong>
								Available after creation
							</div>
						</div>
					</div>
				</aside>

				<form onSubmit={handleSubmit}>
					<div className={styles.formCard}>
						{error && (
							<InlineNotification
								kind="error"
								title="Error"
								subtitle={error}
								lowContrast
								style={{ marginBottom: 0 }}
							/>
						)}

						<div className={styles.formSection}>
							<p className={styles.sectionLabel}>Basic Info</p>
							<FluidForm>
								<TextInput
									id="program-name"
									labelText="Program Name"
									placeholder="e.g. Web Development Bootcamp 2025"
									value={programName}
									onChange={(e) => setProgramName(e.target.value)}
									disabled={loading}
									maxLength={255}
									required
								/>
								<FluidSelect
									id="head-of-program"
									labelText="Head of Program"
									disabled={headLoading || loading}
									value={headOfProgram}
									onChange={(e) => setHeadOfProgram(e.target.value)}
								>
									<SelectItem
										value=""
										text={headLoading ? "Loading users..." : "Select a head of program"}
									/>
									{headItems.map((item) => (
										<SelectItem key={item.id} value={item.id} text={item.text} />
									))}
								</FluidSelect>
							</FluidForm>
						</div>

						<div className={styles.formSection}>
							<p className={styles.sectionLabel}>Schedule</p>
							<FluidForm>
								<div className={styles.dateGrid}>
									<FluidDatePicker
										datePickerType="single"
										onChange={([date]) => setStartDate(date?.toISOString() ?? "")}
									>
										<FluidDatePickerInput
											id="pick-start-date"
											labelText="Start Date"
											placeholder="mm/dd/yyyy"
										/>
									</FluidDatePicker>
									<FluidDatePicker
										datePickerType="single"
										onChange={([date]) => setEndDate(date?.toISOString() ?? "")}
									>
										<FluidDatePickerInput
											id="pick-end-date"
											labelText="End Date"
											placeholder="mm/dd/yyyy"
										/>
									</FluidDatePicker>
								</div>
							</FluidForm>
						</div>

						<div className={styles.formActions}>
							<Button
								kind="ghost"
								onClick={() => router.back()}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button kind="primary" type="submit" disabled={loading}>
								{loading ? "Creating..." : "Create Program"}
							</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
