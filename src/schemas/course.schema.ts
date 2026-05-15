import { z } from "zod";

export const courseSchema = z.object({
	name: z.string().min(1, "Course name is required").max(255, "Name too long"),
	description: z.string().optional(),
	instructorId: z.string().min(1, "Please select an instructor"),
	programId: z.string().min(1, "Please select a program"),
	status: z.string().min(1, "Status is required"),
	startedAt: z.string().min(1, "Start date is required"),
	endedAt: z.string().min(1, "End date is required"),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
