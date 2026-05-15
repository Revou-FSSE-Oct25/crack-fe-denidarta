"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/schemas/profile.schema";
import {
	Button,
	FluidTextInput,
	InlineNotification,
	Select,
	SelectItem,
	TextArea,
} from "@carbon/react";
import { apiFetch } from "@/lib/api-client";
import {
	Profile,
	Gender,
	EducationLevel,
} from "@/types/index.type";
import styles from "./page.module.scss";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
	{ value: "male", label: "Male" },
	{ value: "female", label: "Female" },
	{ value: "other", label: "Other" },
	{ value: "prefer_not_to_say", label: "Prefer not to say" },
];

const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
	{ value: "high_school", label: "High School" },
	{ value: "diploma", label: "Diploma" },
	{ value: "bachelor", label: "Bachelor" },
	{ value: "master", label: "Master" },
	{ value: "doctorate", label: "Doctorate" },
	{ value: "other", label: "Other" },
];

export default function CompleteProfilePage() {
	const router = useRouter();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [checking, setChecking] = useState(true);

	const {
		register,
		handleSubmit,
		control,
		formState: { isSubmitting, errors },
	} = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });

	useEffect(() => {
		async function checkAuth() {
			const token = localStorage.getItem("accessToken");
			if (!token) {
				router.push("/login");
				return;
			}

			const res = await apiFetch("/profiles/me");
			if (res.ok) {
				const { data } = (await res.json()) as { data: Profile };
				if (data?.fullName) {
					router.push("/dashboard-student");
					return;
				}
			}
			setChecking(false);
		}
		void checkAuth();
	}, [router]);

	async function onSubmit(values: ProfileFormValues) {
		setSubmitError(null);
		
		// Clean up empty strings to undefined to satisfy backend validation
		const payload = Object.fromEntries(
			Object.entries(values).map(([key, value]) => [key, value === "" ? undefined : value])
		);

		const res = await apiFetch("/profiles/me", {
			method: "PATCH",
			body: JSON.stringify(payload),
		});
		if (!res.ok) {
			const err = (await res.json()) as { message?: string | string[] };
			setSubmitError(
				Array.isArray(err.message) ? err.message.join(", ") : err.message ?? "Failed to save profile"
			);
			return;
		}
		router.push("/dashboard-student");
	}

	if (checking) return null;

	return (
		<div className={styles.wrapper}>
			<div className={styles.container}>
				<h1 className={styles.title}>Complete Your Profile</h1>
				<p className={styles.subtitle}>
					Fill in your details to get started. All fields are optional.
				</p>

				{submitError && (
					<InlineNotification
						kind="error"
						title="Error"
						subtitle={submitError}
						lowContrast
						style={{ marginBottom: "1.5rem" }}
					/>
				)}

				<form 
					onSubmit={handleSubmit(onSubmit, (err) => console.error("Validation errors:", err))} 
					noValidate
				>
					{/* Section 1: Personal Info */}
					<section className={styles.section}>
						<h2 className={styles.sectionTitle}>Personal Info</h2>
						<div className={styles.grid}>
							<FluidTextInput
								id="fullName"
								labelText="Full Name"
								invalid={!!errors.fullName}
								invalidText={errors.fullName?.message}
								{...register("fullName", { maxLength: 255 })}
							/>
							<FluidTextInput
								id="phoneNumber"
								labelText="Phone Number"
								placeholder="+628123456789"
								// @ts-expect-error FluidTextInput missing helperText in types
								helperText="Indonesian format: +62xxxxxxxxxx"
								invalid={!!errors.phoneNumber}
								invalidText={errors.phoneNumber?.message}
								{...register("phoneNumber", {
									pattern: {
										value: /^(\+62\d{8,13})?$/,
										message: "Use format +62xxxxxxxxxx",
									},
								})}
							/>
							<FluidTextInput
								id="dateOfBirth"
								labelText="Date of Birth"
								// @ts-expect-error FluidTextInput does not have type prop in its type definition
								type="date"
								{...register("dateOfBirth")}
							/>
							<Controller
								name="gender"
								control={control}
								render={({ field }) => (
									<Select id="gender" labelText="Gender" {...field}>
										<SelectItem value="" text="Select gender" />
										{GENDER_OPTIONS.map((o) => (
											<SelectItem
												key={o.value}
												value={o.value}
												text={o.label}
											/>
										))}
									</Select>
								)}
							/>
						</div>
					</section>

					{/* Section 2: Address */}
					<section className={styles.section}>
						<h2 className={styles.sectionTitle}>Address</h2>
						<div className={styles.grid}>
							<div className={styles.fullWidth}>
								<TextArea
									id="streetAddress"
									labelText="Street Address"
									rows={2}
									{...register("streetAddress", { maxLength: 500 })}
								/>
							</div>
							<FluidTextInput
								id="city"
								labelText="City"
								{...register("city", { maxLength: 100 })}
							/>
							<FluidTextInput
								id="province"
								labelText="Province"
								{...register("province", { maxLength: 100 })}
							/>
							<FluidTextInput
								id="district"
								labelText="District"
								{...register("district", { maxLength: 100 })}
							/>
							<FluidTextInput
								id="subdistrict"
								labelText="Subdistrict"
								{...register("subdistrict", { maxLength: 100 })}
							/>
							<FluidTextInput
								id="postalCode"
								labelText="Postal Code"
								{...register("postalCode", { maxLength: 20 })}
							/>
							<FluidTextInput
								id="country"
								labelText="Country"
								{...register("country", { maxLength: 100 })}
							/>
						</div>
					</section>

					{/* Section 3: Professional & Education */}
					<section className={styles.section}>
						<h2 className={styles.sectionTitle}>Professional & Education</h2>
						<div className={styles.grid}>
							<FluidTextInput
								id="currentOccupation"
								labelText="Current Occupation"
								{...register("currentOccupation", { maxLength: 255 })}
							/>
							<FluidTextInput
								id="company"
								labelText="Company"
								{...register("company", { maxLength: 255 })}
							/>
							<Controller
								name="highestEducation"
								control={control}
								render={({ field }) => (
									<Select
										id="highestEducation"
										labelText="Highest Education"
										{...field}
									>
										<SelectItem value="" text="Select education level" />
										{EDUCATION_OPTIONS.map((o) => (
											<SelectItem
												key={o.value}
												value={o.value}
												text={o.label}
											/>
										))}
									</Select>
								)}
							/>
							<FluidTextInput
								id="fieldOfStudy"
								labelText="Field of Study"
								{...register("fieldOfStudy", { maxLength: 255 })}
							/>
							<FluidTextInput
								id="linkedinUrl"
								labelText="LinkedIn URL"
								// @ts-expect-error FluidTextInput does not have type prop in its type definition
								type="url"
								{...register("linkedinUrl")}
							/>
							<FluidTextInput
								id="githubUrl"
								labelText="GitHub URL"
								// @ts-expect-error FluidTextInput does not have type prop in its type definition
								type="url"
								{...register("githubUrl")}
							/>
							<FluidTextInput
								id="personalWebsite"
								labelText="Personal Website"
								// @ts-expect-error FluidTextInput does not have type prop in its type definition
								type="url"
								{...register("personalWebsite")}
							/>
							<div className={styles.fullWidth}>
								<TextArea
									id="shortBio"
									labelText="Short Bio"
									rows={3}
									{...register("shortBio")}
								/>
							</div>
						</div>
					</section>

					<div className={styles.submitRow}>
						<Button type="submit" kind="primary" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save Profile"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
