import { z } from "zod";

export const programSchema = z.object({
	programName: z.string().min(1, "Program name is required").max(255, "Name too long"),
	headOfProgram: z.string().optional(),
});

export type ProgramFormValues = z.infer<typeof programSchema>;
