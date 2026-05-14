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
	Modal,
} from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";
import { apiFetch } from "@/lib/api-client";
import styles from "./page.module.scss";

interface PageProps {
	params: Promise<{ inviteToken: string }>;
}

export default function CreateAccountPage({ params }: PageProps) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	const email = searchParams.get("email") || "";
	const inviteTokenPromise = params;

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validation
		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		try {
			setLoading(true);
			const { inviteToken } = await inviteTokenPromise;

			const res = await apiFetch("/auth/set-password", {
				method: "POST",
				body: JSON.stringify({
					inviteToken,
					password,
				}),
			});

			if (!res.ok) {
				const errorData = (await res.json()) as { message?: string };
				setError(
					errorData.message || "Failed to create account. Please try again.",
				);
				return;
			}

			setShowSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleSuccessModalClose = () => {
		router.push("/login");
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

				<Form onSubmit={onSubmit} noValidate className={styles.form}>
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
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>

							<FluidPasswordInput
								id={"confirm-password"}
								labelText={"Confirm Password"}
								placeholder={"Confirm Password"}
								invalid={
									confirmPassword.length > 0 && password !== confirmPassword
								}
								invalidText={
									password !== confirmPassword ? "Passwords do not match" : ""
								}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								disabled={password === ""}
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
							disabled={loading || password.length === 0}
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

			{/* Success Modal */}
			<Modal
				open={showSuccess}
				modalHeading="Account Created Successfully"
				primaryButtonText="Go to Login"
				onRequestClose={handleSuccessModalClose}
				onRequestSubmit={handleSuccessModalClose}
				shouldSubmitOnEnter
			>
				<p>
					Your account has been created successfully! You can now log in with
					your credentials.
				</p>
			</Modal>
		</div>
	);
}
