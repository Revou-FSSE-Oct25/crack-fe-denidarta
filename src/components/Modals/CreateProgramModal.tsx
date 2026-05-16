"use client";

import {
	Modal,
	TextInput,
	Form,
	Select,
	SelectItem,
	InlineNotification,
	Stack,
} from "@carbon/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createProgram } from "@/services/programs.service";
import { getCurrentUser } from "@/services/profile.service";
import { fetchAdminsAndInstructors } from "@/services/users.service";
import {
	programSchema,
	type ProgramFormValues,
} from "@/schemas/program.schema";

interface CreateProgramModalProps {
	open: boolean;
	onRequestClose: () => void;
	onSuccess: () => void;
}

export default function CreateProgramModal({
	open,
	onRequestClose,
	onSuccess,
}: CreateProgramModalProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { data: rawUsers = [], isLoading: headLoading } = useQuery({
		queryKey: ["users", "admins-instructors"],
		queryFn: fetchAdminsAndInstructors,
	});
	const headItems = rawUsers.map((u) => ({ id: u.id, text: u.username }));

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ProgramFormValues>({
		resolver: zodResolver(programSchema),
		defaultValues: { programName: "", headOfProgram: "" },
	});

	const handleClose = () => {
		reset();
		setError(null);
		onRequestClose();
	};

	const onSubmit = async (values: ProgramFormValues) => {
		setLoading(true);
		setError(null);
		try {
			const user = await getCurrentUser();
			await createProgram(
				values.programName,
				user.id,
				values.headOfProgram || undefined,
			);
			handleClose();
			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create program");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			aria-label="Create program modal"
			modalHeading="Create New Program"
			open={open}
			primaryButtonText={loading ? "Creating..." : "Create Program"}
			secondaryButtonText="Cancel"
			primaryButtonDisabled={loading}
			onRequestClose={handleClose}
			onRequestSubmit={handleSubmit(onSubmit)}
			onSecondarySubmit={handleClose}
		>
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
					<TextInput
						id="program-name"
						labelText="Program Name"
						placeholder="e.g. Web Development Bootcamp 2025"
						disabled={loading}
						maxLength={255}
						invalid={!!errors.programName}
						invalidText={errors.programName?.message}
						{...register("programName")}
					/>
					<Select
						id="head-of-program"
						labelText="Head of Program"
						disabled={headLoading || loading}
						{...register("headOfProgram")}
					>
						<SelectItem
							value=""
							text={
								headLoading ? "Loading users..." : "Select a head of program"
							}
						/>
						{headItems.map((item) => (
							<SelectItem key={item.id} value={item.id} text={item.text} />
						))}
					</Select>
				</Stack>
			</Form>
		</Modal>
	);
}
