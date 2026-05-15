import { z } from "zod";

export const addUserSchema = z.object({
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	username: z.string().min(1, "Username is required"),
	role: z.enum(["student", "instructor", "admin"]),
});

export type AddUserFormValues = z.infer<typeof addUserSchema>;
