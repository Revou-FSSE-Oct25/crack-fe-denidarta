import { Course } from "./course";

export interface Program {
	id: string;
	name: string;
	created_by: string;
	creator: {
		id: string;
		username: string;
		profile: { fullName: string | null } | null;
	};
	courses: Course[];
	created_at: string;
	updated_at: string;
}
