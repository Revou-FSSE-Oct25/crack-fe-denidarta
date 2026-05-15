import { z } from "zod";

export const profileSchema = z.object({
	fullName: z.string().max(255).optional(),
	phoneNumber: z
		.string()
		.max(20)
		.regex(/^\+?[\d\s\-().]*$/, "Invalid phone number")
		.optional()
		.or(z.literal("")),
	dateOfBirth: z.string().optional(),
	gender: z.string().optional(),
	streetAddress: z.string().max(500).optional(),
	city: z.string().max(100).optional(),
	province: z.string().max(100).optional(),
	district: z.string().max(100).optional(),
	subdistrict: z.string().max(100).optional(),
	postalCode: z.string().max(20).optional(),
	country: z.string().max(100).optional(),
	timezone: z.string().optional(),
	currentOccupation: z.string().max(255).optional(),
	company: z.string().max(255).optional(),
	highestEducation: z.string().optional(),
	fieldOfStudy: z.string().max(255).optional(),
	linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
	githubUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
	personalWebsite: z.string().url("Invalid URL").optional().or(z.literal("")),
	shortBio: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
