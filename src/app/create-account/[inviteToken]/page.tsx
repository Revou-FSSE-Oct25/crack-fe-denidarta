"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Button,
	Form,
	Stack,
	InlineNotification,
	FluidPasswordInput,
	FluidTextInput,
	Link,
} from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/lib/api-client";
import { createAccountSchema, type CreateAccountFormValues } from "@/schemas/auth.schema";
import styles from "./page.module.scss";

interface PageProps {
	params: Promise<{ inviteToken: string }>;
}

export default function CreateAccountPage({ params }: PageProps) {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	const email = searchParams.get("email") || "";
	const inviteTokenPromise = params;

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<CreateAccountFormValues>({ resolver: zodResolver(createAccountSchema) });

	const passwordValue = watch("password", "");

	const onSubmit = async (data: CreateAccountFormValues) => {
		setError(null);
		try {
			setLoading(true);
			const { inviteToken } = await inviteTokenPromise;

			const res = await apiFetch("/auth/set-password", {
				method: "POST",
				body: JSON.stringify({
					inviteToken,
					password: data.password,
				}),
			});

			if (!res.ok) {
				const errorData = (await res.json()) as { message?: string };
				setError(
					errorData.message || "Failed to create account. Please try again.",
				);
				return;
			}

			// Auto-login after successful activation
			const loginRes = await apiFetch("/auth/login", {
				method: "POST",
				body: JSON.stringify({ email, password: data.password }),
			});

			if (loginRes.ok) {
				const { data: loginData } = (await loginRes.json()) as {
					data: { accessToken: string; refreshToken?: string };
				};
				localStorage.setItem("accessToken", loginData.accessToken);
				if (loginData.refreshToken) {
					localStorage.setItem("refreshToken", loginData.refreshToken);
				}
				router.push("/complete-profile");
			} else {
				// Activation succeeded but login failed — fall back to login page
				router.push("/login");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.leftPanel}>
				<div className={styles.brand}>
					<div className={styles.brandIcon} />
					<span className={styles.brandName}>LMS Portal</span>
				</div>

				<div className={styles.header}>
					<h1>Complete your account</h1>
					<p>
						You were invited! Set a password to activate your account and start
						learning.
					</p>
				</div>

				{error && (
					<InlineNotification
						kind="error"
						title="Error"
						subtitle={error}
						lowContrast
						className={styles.notification}
						onCloseButtonClick={() => setError(null)}
					/>
				)}

				<Form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
					<Stack gap={0}>
						{/* Email Field */}
						<FluidTextInput
							id="email-input"
							labelText="Email address"
							placeholder="Email"
							value={email}
							disabled
						/>
						<p className={styles.helperText}>
							Filled automatically from your invitation link.
						</p>

						{/* Password Field */}
						<div className={styles.fieldGroup}>
							<FluidPasswordInput
								id={"password-input"}
								labelText={"Password"}
								placeholder={"Password"}
								invalid={!!errors.password}
								invalidText={errors.password?.message}
								{...register("password")}
							/>

							<FluidPasswordInput
								id={"confirm-password"}
								labelText={"Confirm Password"}
								placeholder={"Confirm Password"}
								invalid={!!errors.confirmPassword}
								invalidText={errors.confirmPassword?.message}
								disabled={!passwordValue}
								{...register("confirmPassword")}
							/>
						</div>

						{/* Button */}
						<Button
							id={"submit-form"}
							type="submit"
							kind="primary"
							size="lg"
							renderIcon={ArrowRight}
							className={styles.submitButton}
							disabled={loading || !passwordValue}
						>
							{loading ? "Creating account..." : "Create account"}
						</Button>

						{/* Terms Text */}
						<p className={styles.termsText}>
							By creating an account, you agree to the Terms of Use and Privacy
							Policy.
						</p>
					</Stack>
				</Form>

				{/* Sign In Link */}
				<div className={styles.signInRow}>
					<p className={styles.signInLabel}>Already have an account?</p>
					<Link href={"/login"}>Sign In</Link>
				</div>
			</div>

			{/* Right Panel */}
			<div className={styles.rightPanel}>
				<div className={styles.rightInner}>
					{/* Hero Image */}
					<div className={styles.heroImage} />

					{/* Quote Section */}
					<div className={styles.quoteBlock}>
						<p className={styles.quoteText}>
							&ldquo;Learning is not attained by chance, it must be sought for
							with ardor and attended to with diligence.&rdquo;
						</p>
						<div className={styles.quoteMeta}>
							<div className={styles.quoteDivider} />
							<span className={styles.quoteAuthor}>Abigail Adams</span>
						</div>
					</div>

					{/* Stats */}
					<div className={styles.statsRow}>
						<div className={styles.statItem}>
							<div className={styles.statNum}>12,000+</div>
							<div className={styles.statLabel}>Active students</div>
						</div>
						<div className={styles.statItem}>
							<div className={styles.statNum}>48</div>
							<div className={styles.statLabel}>Courses available</div>
						</div>
						<div className={styles.statItem}>
							<div className={styles.statNum}>98%</div>
							<div className={styles.statLabel}>Completion rate</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
