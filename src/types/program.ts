import { Course } from "./course";

export interface Program {
	id: string;
	name: string;
	created_by: string;
	head_of_program_id: string | null;
	creator: {
		id: string;
		username: string;
		profile: { fullName: string | null } | null;
	};
	headOfProgram: {
		id: string;
		username: string;
		profile: { fullName: string | null } | null;
	} | null;
	courses: Course[];
	created_at: string;
	updated_at: string;
}
