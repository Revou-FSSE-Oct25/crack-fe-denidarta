"use client";

import { useState } from "react";
import { Modal, TextInput, Select, SelectItem, InlineNotification } from "@carbon/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/lib/api-client";
import { inviteUser } from "@/services/users.service";
import { addUserSchema, type AddUserFormValues } from "@/schemas/user.schema";

interface AddNewUserModalProps {
	open: boolean;
	onRequestClose: () => void;
	onSuccess: () => void;
}

export default function AddNewUserModal({
	open,
	onRequestClose,
	onSuccess,
}: AddNewUserModalProps) {
	const [invitationLink, setInvitationLink] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<AddUserFormValues>({ resolver: zodResolver(addUserSchema) });

	const handleClose = () => {
		reset();
		setInvitationLink(null);
		setSubmitError(null);
		onRequestClose();
	};

	const onSubmit = async (values: AddUserFormValues) => {
		setSubmitError(null);
		setSubmitting(true);
		try {
			const res = await apiFetch("/users", {
				method: "POST",
				body: JSON.stringify({ username: values.username, email: values.email, role: values.role }),
			});

			if (res.status === 409) {
				setSubmitError("Email already registered");
				return;
			}
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { message?: string };
				throw new Error(body.message ?? `Error ${res.status}`);
			}

			const { data: { data: user } } = (await res.json()) as { data: { data: { id: string } } };
			const token = await inviteUser(user.id);
			const link = `${window.location.origin}/create-account/${token}?email=${encodeURIComponent(values.email)}`;
			setInvitationLink(link);
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : "Failed to add user");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDone = () => {
		handleClose();
		onSuccess();
	};

	if (invitationLink) {
		return (
			<Modal
				aria-label="Invitation link modal"
				modalHeading="User Invited"
				open={open}
				primaryButtonText="Done"
				onRequestClose={handleDone}
				onRequestSubmit={handleDone}
				secondaryButtonText=""
			>
				<p style={{ marginBottom: "1rem" }}>
					Share this invitation link with the user:
				</p>
				<TextInput
					id="invitation-link"
					labelText="Invitation Link"
					value={invitationLink}
					readOnly
					onClick={(e) => (e.target as HTMLInputElement).select()}
				/>
			</Modal>
		);
	}

	return (
		<Modal
			aria-label="Add new user modal"
			modalHeading="Add New User"
			open={open}
			primaryButtonText={submitting ? "Adding..." : "Add"}
			primaryButtonDisabled={submitting}
			secondaryButtonText="Cancel"
			onRequestClose={handleClose}
			onRequestSubmit={handleSubmit(onSubmit)}
			onSecondarySubmit={handleClose}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				{submitError && (
					<InlineNotification
						kind="error"
						title="Error"
						subtitle={submitError}
						lowContrast
						onClose={() => setSubmitError(null)}
					/>
				)}
				<TextInput
					data-modal-primary-focus
					id="add-user-email"
					labelText="Email"
					placeholder="user@example.com"
					invalid={!!errors.email}
					invalidText={errors.email?.message}
					{...register("email")}
				/>
				<TextInput
					id="username"
					labelText="Username"
					placeholder="e.g. john_doe"
					invalid={!!errors.username}
					invalidText={errors.username?.message}
					{...register("username")}
				/>
				<Select
					id="add-user-role"
					labelText="Role"
					invalid={!!errors.role}
					invalidText={errors.role?.message}
					{...register("role")}
				>
					<SelectItem text="Student" value="student" />
					<SelectItem text="Instructor" value="instructor" />
					<SelectItem text="Admin" value="admin" />
				</Select>
			</div>
		</Modal>
	);
}
