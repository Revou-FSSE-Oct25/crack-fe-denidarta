import { z } from "zod";

export const gradingCriteriaItemSchema = z.object({
	label: z.string().min(1, "Label is required"),
	description: z.string().optional(),
	points: z.number({ error: "Points are required" }).min(1, "Points must be at least 1"),
});

export const assignmentSchema = z.object({
	courseId: z.string().min(1, "Please select a course"),
	title: z.string().min(1, "Title is required").max(255, "Title too long"),
	description: z.string().optional(),
	dueDate: z.string().min(1, "Due date is required"),
	minPoints: z.number({ error: "Min points required" }).min(0),
	status: z.string().min(1, "Status is required"),
	gradingCriteria: z.array(gradingCriteriaItemSchema),
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;
