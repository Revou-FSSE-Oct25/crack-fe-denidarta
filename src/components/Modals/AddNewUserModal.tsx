"use client";

import { Modal, TextInput, Select, SelectItem } from "@carbon/react";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client";

interface AddNewUserModalProps {
	open: boolean;
	onRequestClose: () => void;
	onRequestSubmit: (userId: string, email: string) => Promise<string>;
}

export default function AddNewUserModal({
	open,
	onRequestClose,
	onRequestSubmit,
}: AddNewUserModalProps) {
	const [email, setEmail] = useState("");
	const [fullName, setFullName] = useState("");
	const [role, setRole] = useState("student");
	const [emailError, setEmailError] = useState("");
	const [invitationLink, setInvitationLink] = useState<string | null>(null);

	const handleSubmit = async () => {
		setEmailError("");

		const emailInput = document.createElement("input");
		emailInput.type = "email";
		emailInput.value = email;
		if (!emailInput.checkValidity()) {
			setEmailError("Please enter a valid email address");
			return;
		}

		const res = await apiFetch("/users", {
			method: "POST",
			body: JSON.stringify({ username: fullName, email, role }),
		});

		if (res.status === 409) {
			setEmailError("Email already registered");
			return;
		}

		if (!res.ok) return;

		const { data: user } = (await res.json()) as { data: { id: string } };
		const link = await onRequestSubmit(user.id, email);
		setInvitationLink(link);
	};

	const handleClose = () => {
		setEmail("");
		setFullName("");
		setRole("student");
		setEmailError("");
		setInvitationLink(null);
		onRequestClose();
	};

	if (invitationLink) {
		return (
			<Modal
				aria-label="Invitation link modal"
				modalHeading="User Invited"
				open={open}
				primaryButtonText="Done"
				onRequestClose={handleClose}
				onRequestSubmit={handleClose}
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
			primaryButtonText="Add"
			secondaryButtonText="Cancel"
			onRequestClose={handleClose}
			onRequestSubmit={handleSubmit}
			onSecondarySubmit={handleClose}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				<TextInput
					data-modal-primary-focus
					id="add-user-email"
					labelText="Email"
					placeholder="user@example.com"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
						setEmailError("");
					}}
					invalid={!!emailError}
					invalidText={emailError}
				/>
				<TextInput
					id="username"
					labelText="Username"
					placeholder="e.g. john_doe"
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
				/>
				<Select
					id="add-user-role"
					labelText="Role"
					value={role}
					onChange={(e) => setRole(e.target.value)}
				>
					<SelectItem text="Student" value="student" />
					<SelectItem text="Instructor" value="instructor" />
					<SelectItem text="Admin" value="admin" />
				</Select>
			</div>
		</Modal>
	);
}
