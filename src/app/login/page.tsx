"use client";

import { useState } from "react";
import {
	Button,
	Form,
	PasswordInput,
	TextInput,
	Tile,
	InlineNotification,
	Stack,
	Link,
} from "@carbon/react";
import { ArrowRight, UserAvatar } from "@carbon/icons-react";
import styles from "./page.module.scss";
import { useForm } from "react-hook-form";
import { login } from "@/services/auth.service";
import { LoginFormValues } from "@/types/index.type";

export default function LoginPage() {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>();

	const onSubmit = async (data: LoginFormValues) => {
		setError(null);
		setLoading(true);
		try {
			const res = await login(data);
			localStorage.setItem("accessToken", res.accessToken);
			localStorage.setItem("refreshToken", res.refreshToken);

			// Decode JWT payload to determine user role
			const payloadBase64 = res.accessToken.split(".")[1];
			const payload = JSON.parse(atob(payloadBase64)) as { role?: string };
			const role = payload.role;

			if (role === "admin" || role === "instructor") {
				window.location.href = "/dashboard-admin";
			} else {
				window.location.href = "/dashboard-student";
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.container}>
				<div className={styles.brand}>
					<UserAvatar size={32} />
					<span>LMS Portal</span>
				</div>

				<Tile className={styles.tile}>
					<div className={styles.header}>
						<h1>Sign in</h1>
						<p>Welcome back. Enter your credentials to continue.</p>
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

					<Form onSubmit={handleSubmit(onSubmit)} noValidate>
						<Stack gap={6}>
							<TextInput
								id="email"
								type="email"
								labelText="Email address"
								placeholder="Registered email address"
								invalid={!!errors.email}
								invalidText={errors.email?.message}
								{...register("email", { required: "Email is required" })}
							/>

							<PasswordInput
								id="password"
								labelText="Password"
								placeholder="Enter your password"
								invalid={!!errors.password}
								invalidText={errors.password?.message}
								{...register("password", { required: "Password is required" })}
							/>

							<Button
								type="submit"
								kind="primary"
								size="lg"
								renderIcon={ArrowRight}
								className={styles.submitButton}
								disabled={loading}
							>
								{loading ? "Signing in…" : "Sign in"}
							</Button>
							<div className={styles.invitation}>
								<p>Have invitation link?</p>
								<Link href="/create-account" className={styles.link}>
									Activate Your Account
								</Link>
							</div>
						</Stack>
					</Form>
				</Tile>

				<p className={styles.footer}>
					Having trouble? <a href="mailto:support@lms.dev">Contact support</a>
				</p>
			</div>
		</div>
	);
}
