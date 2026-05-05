export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type EducationLevel =
	| "high_school"
	| "diploma"
	| "bachelor"
	| "master"
	| "doctorate"
	| "other";

export interface Profile {
	id: string;
	userId: string;
	fullName?: string;
	dateOfBirth?: string;
	gender?: Gender;
	phoneNumber?: string;
	streetAddress?: string;
	city?: string;
	province?: string;
	district?: string;
	subdistrict?: string;
	postalCode?: string;
	country?: string;
	timezone?: string;
	avatarUrl?: string;
	linkedinUrl?: string;
	githubUrl?: string;
	personalWebsite?: string;
	shortBio?: string;
	currentOccupation?: string;
	company?: string;
	highestEducation?: EducationLevel;
	fieldOfStudy?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ProfileFormValues {
	fullName?: string;
	dateOfBirth?: string;
	gender?: Gender;
	phoneNumber?: string;
	streetAddress?: string;
	city?: string;
	province?: string;
	district?: string;
	subdistrict?: string;
	postalCode?: string;
	country?: string;
	timezone?: string;
	linkedinUrl?: string;
	githubUrl?: string;
	personalWebsite?: string;
	shortBio?: string;
	currentOccupation?: string;
	company?: string;
	highestEducation?: EducationLevel;
	fieldOfStudy?: string;
}
